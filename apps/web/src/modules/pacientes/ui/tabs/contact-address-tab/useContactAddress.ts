// cspell:disable
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  PatientFormValues,
  fetchAddressFromCEP,
} from "@/lib/patient-validation";
import { maskPhone, maskCEP } from "@/lib/input-masks";
import { toast } from "sonner";

export function useContactAddress(form: UseFormReturn<PatientFormValues>) {
  const [loadingCEP, setLoadingCEP] = useState(false);

  const handleSearchCEP = async () => {
    const cep = form.getValues("address_zipcode");
    if (!cep) {
      toast.error("Digite um CEP para buscar");
      return;
    }

    setLoadingCEP(true);
    try {
      const address = await fetchAddressFromCEP(cep);
      if (address) {
        form.setValue("address_street", address.address_street);
        form.setValue("address_neighborhood", address.address_neighborhood);
        form.setValue("address_city", address.address_city);
        form.setValue("address_state", address.address_state);
        form.setValue("address_country", address.address_country);
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCEP(false);
    }
  };

  const handlePhoneChange = (value: string) => maskPhone(value);
  const handleCEPChange = (value: string) => maskCEP(value);

  return {
    loadingCEP,
    handleSearchCEP,
    handlePhoneChange,
    handleCEPChange,
  };
}
