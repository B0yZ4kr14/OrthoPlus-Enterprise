import sys
import re
import subprocess
from collections import defaultdict

def fix():
    print("Fixing JSX comments...")
    res = subprocess.run(["./node_modules/.bin/tsc", "--noEmit", "-p", "apps/web/tsconfig.json"], capture_output=True, text=True)
    
    # Catch syntax error TS1005 ("'}' expected." or "expected.") near our injected comments
    pattern = re.compile(r"^(.*?)\((\d+),\d+\): error TS1005")
    fixes = set()
    for line in res.stdout.split('\n'):
        m = pattern.match(line)
        if m:
            fixes.add((m.group(1), int(m.group(2))))
            
    by_file = defaultdict(list)
    for f, l in fixes:
        by_file[f].append(l)
        
    for f, lines in by_file.items():
        try:
            with open(f, 'r') as file:
                content = file.readlines()
            for l in lines:
                idx = l - 1
                # Usually the error is flagged on the line with the comment, or the line BELOW it.
                # Let's check both current line and the one above.
                if idx >= 0 and "// @ts-expect-error" in content[idx]:
                    content[idx] = content[idx].replace("// @ts-expect-error", "{/* @ts-expect-error").rstrip() + " */}\n"
                elif idx - 1 >= 0 and "// @ts-expect-error" in content[idx - 1]:
                    content[idx - 1] = content[idx - 1].replace("// @ts-expect-error", "{/* @ts-expect-error").rstrip() + " */}\n"
            with open(f, 'w') as file:
                file.writelines(content)
            print(f"Fixed JSX comments in {f}")
        except Exception as e:
            print(f"Error fixing {f}: {e}")

if __name__ == "__main__":
    fix()
