import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AutoDiagnosticoProps {
  texto: string;
}

export function AutoDiagnostico({ texto }: AutoDiagnosticoProps) {
  return (
    <Card className="border-cyan-500/20 bg-cyan-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <CardTitle className="text-sm">Diagnóstico Automático</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-slate-300">{texto}</p>
      </CardContent>
    </Card>
  );
}
