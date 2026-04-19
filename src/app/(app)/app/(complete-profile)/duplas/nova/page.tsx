import { Card } from "@/components/ui/card";
import { PairCreateForm } from "@/components/pairs/pair-create-form";

export default function NewPairPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8" variant="soft">
        <p className="eyebrow text-xs font-semibold text-brand">Nova dupla</p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Comece a usar mesmo antes da outra pessoa entrar.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Ao criar a dupla, você já entra como primeiro membro e cai na tela de
          detalhe para seguir com o convite.
        </p>
      </Card>

      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">Criar dupla</p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          Dê um nome rápido para esse espaço.
        </h2>
        <p className="mt-3 text-base text-muted">
          Esse nome vai aparecer na lista principal e no detalhe da dupla.
        </p>
        <div className="mt-8">
          <PairCreateForm />
        </div>
      </Card>
    </div>
  );
}
