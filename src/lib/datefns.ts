import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatarData = (data: Date) => {
  return format(data, "dd MMM yyyy", {
    locale: ptBR
  });
}
