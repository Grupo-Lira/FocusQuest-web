"use client";

import { Button } from "./Button";
import { Card } from "./Card";

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly patientName: string;
  readonly isLoading: boolean;
};

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isLoading,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card title="Confirmar Exclusão">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--text)]">
            Tem certeza que deseja excluir o paciente{" "}
            <span className="font-semibold">{patientName}</span>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button
              text="Cancelar"
              onClick={onClose}
              className="px-6 py-2.5"
              disabled={isLoading}
            />
            <Button
              text="Excluir"
              onClick={onConfirm}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700"
              isLoading={isLoading}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
