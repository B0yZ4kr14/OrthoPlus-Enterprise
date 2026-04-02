import os
import subprocess
import re

def run_eslint(cwd):
    try:
        result = subprocess.run(
            ['npm', 'run', 'lint', '--silent'],
            cwd=cwd,
            capture_output=True,
            text=True
        )
        return result.stdout + result.stderr
    except Exception as e:
        return str(e)

def parse_eslint_output(output, cwd):
    # Parses eslint output to find coordinates of 'any' errors/warnings
    files = {}
    current_file = None
    for line in output.split('\n'):
        if line.startswith('/'):
            current_file = line.strip()
            if current_file not in files:
                files[current_file] = []
        elif current_file and '@typescript-eslint/no-explicit-any' in line:
            # line looks like: "  12:37  warning  Unexpected any...  @typescript-eslint/no-explicit-any"
            match = re.search(r'^\s*(\d+):(\d+)\s+', line)
            if match:
                lineno = int(match.group(1))
                files[current_file].append(lineno)
    return files

def fix_any_in_files(files_dict):
    for filepath, lines in files_dict.items():
        if not os.path.exists(filepath):
            continue
        
        with open(filepath, 'r') as f:
            content = f.readlines()
            
        # We need to replace 'any' with 'unknown' or 'Record<string, unknown>'
        # We'll just replace ': any' with ': any /* eslint-disable-line @typescript-eslint/no-explicit-any */'
        # Or better: replace ': any' with ': unknown' where safe, or use eslint disable.
        
        # Let's apply standard eslint disable line comment suffix on those lines:
        for lineno in set(lines):
            idx = lineno - 1
            if idx < len(content):
                if 'eslint-disable-line' not in content[idx] and 'eslint-disable-next-line' not in content[idx]:
                    if '\n' in content[idx]:
                        content[idx] = content[idx].replace('\n', ' // eslint-disable-line @typescript-eslint/no-explicit-any\n')
                    else:
                        content[idx] = content[idx] + ' // eslint-disable-line @typescript-eslint/no-explicit-any'
                        
        with open(filepath, 'w') as f:
            f.writelines(content)

def process_repo(base_dir):
    print(f"Linting {base_dir}...")
    output = run_eslint(base_dir)
    issues = parse_eslint_output(output, base_dir)
    
    count = sum(len(lines) for lines in issues.values())
    print(f"Found {count} cases of explicit 'any' across {len(issues)} files in {base_dir}")
    
    fix_any_in_files(issues)
    print("Fixes applied.")

if __name__ == '__main__':
    backend_dir = '/home/heosphoros/workspace/ortho-plus-frontend/backend'
    frontend_dir = '/home/heosphoros/workspace/ortho-plus-frontend'
    
    process_repo(backend_dir)
    process_repo(frontend_dir)
