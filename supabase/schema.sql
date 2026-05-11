-- Tabela de Configurações da Loja
CREATE TABLE public.store_settings (
    id text PRIMARY KEY,
    address text NOT NULL,
    opening_hours text NOT NULL,
    start_hour integer NOT NULL,
    end_hour integer NOT NULL,
    opening_days integer[] NOT NULL DEFAULT '{}'::integer[]
);

-- Inserir configuração padrão
INSERT INTO public.store_settings (id, address, opening_hours, start_hour, end_hour, opening_days)
VALUES ('main', 'Via Universitária, Simões Filho, BA', '08:00 - 19:00', 8, 19, ARRAY[1, 2, 3, 4, 5, 6]);

-- Habilitar Segurança em Nível de Linha (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- 1. Qualquer pessoa pode ler as configurações (para mostrar na página inicial)
CREATE POLICY "Configurações são públicas para leitura"
    ON public.store_settings FOR SELECT
    USING (true);

-- 2. Apenas usuários logados no painel admin podem modificar
CREATE POLICY "Apenas usuários autenticados podem modificar"
    ON public.store_settings FOR ALL
    USING (auth.role() = 'authenticated');
