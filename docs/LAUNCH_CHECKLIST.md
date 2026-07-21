# Checklist de lançamento BICOJÁ

## Antes do beta fechado

- Execute `0043_launch_operations_and_support.sql` no Supabase.
- Crie o segredo `OPERATIONAL_CRON_SECRET` no Supabase e publique `operational-maintenance` sem verificação de JWT.
- Configure um Cron Trigger no Cloudflare para chamar a função a cada 15 minutos, enviando o cabeçalho `x-cron-secret`. Isso executa conclusões automáticas e libera saldos cuja garantia venceu.
- Use o modo `sandbox` até validar Pix/cartão com contas de teste do Mercado Pago.
- Confirme os fluxos: proposta concorrente, pagamento aprovado/recusado, fotos obrigatórias, disputa, reembolso, garantia e saque.

## Antes do lançamento público

- Troque para credenciais reais e modo `producao` somente após validar os webhooks reais.
- Defina a operação de pagamentos aos prestadores: responsável, prazo, comprovante e conciliação diária.
- Revise Termos, Privacidade/LGPD, política de cancelamento e suporte.
- Ative backup do banco, rotação de credenciais e uma segunda conta administradora.
- Revise permissões RLS, teste em celulares Android físicos e documente o atendimento de incidentes.
