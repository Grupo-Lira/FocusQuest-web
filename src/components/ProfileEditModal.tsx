"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { getMyProfile, updateMyProfile } from "@/services/usuario.service";
import { logout } from "@/services/auth.service";
import { clearAuthToken } from "@/utils/authStorage";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

type UserProfile = {
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
};

export function ProfileEditModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<UserProfile>({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();

      setFormData({
        nome: data.data.nome || "",
        email: data.data.email || "",
        telefone: data.data.telefone || "",
        especialidade: data.data.especialidade || "",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar perfil";
      showError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateMyProfile(formData);
      showSuccess("Perfil atualizado com sucesso!");
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar perfil";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      clearAuthToken();
      showSuccess("Logout realizado com sucesso!");
      onClose();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer logout";
      showError(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card title="Editar Perfil">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[var(--text)] font-semibold">Nome</label>
            <Input
              type="text"
              placeholder="Digite seu nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[var(--text)] font-semibold">Email</label>
            <Input
              type="text"
              placeholder="Digite seu email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[var(--text)] font-semibold">Telefone</label>
            <Input
              type="text"
              placeholder="Digite seu telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[var(--text)] font-semibold">Especialidade</label>
            <Input
              type="text"
              placeholder="Digite sua especialidade"
              name="especialidade"
              value={formData.especialidade}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              text="Cancelar"
              onClick={onClose}
              className="px-6 py-2.5"
              variant="gray"
            />
            <Button
              text="Salvar"
              type="submit"
              className="px-6 py-2.5"
              isLoading={isLoading}
            />
          </div>
        </form>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <Button
            text="Sair da Conta"
            onClick={handleLogout}
            className="w-full px-6 py-2.5"
            variant="gray"
            isLoading={isLoggingOut}
          />
        </div>
      </Card>
    </div>
  );
}
