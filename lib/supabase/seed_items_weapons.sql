-- Seed canônico de armas — Tabela 3-4 (Livro Básico, pág. 99-101)
-- Execute APÓS migrate_equipment.sql
-- Valide com: npm run validate:seed

insert into public.items (
  slug, name, category, price_pc, spaces, description,
  weapon_proficiency, weapon_grip, weapon_purpose,
  weapon_damage_dice, weapon_critical, weapon_range, weapon_damage_type,
  weapon_abilities, is_stackable, is_starter_eligible, page_ref
)
values
-- SIMPLES — corpo a corpo — leves
('adaga','Adaga','arma',20,1,'Lâmina curta e fácil de ocultar.','simples','leve','corpo_a_corpo','1d4','19','curto','perfuracao','{arremessavel,discreta,ligeira}',false,true,99),
('espada_curta','Espada curta','arma',100,1,'Lâmina ágil de uma mão.','simples','leve','corpo_a_corpo','1d6','19','nenhum','perfuracao','{}',false,true,99),
('foice','Foice','arma',40,1,'Ferramenta rural adaptada para combate.','simples','leve','corpo_a_corpo','1d6','x3','nenhum','corte','{}',false,true,99),
('punhal','Punhal','arma',60,1,'Adaga robusta para golpes precisos.','simples','leve','corpo_a_corpo','1d4','19','nenhum','perfuracao','{discreta,ligeira}',false,true,99),
-- SIMPLES — corpo a corpo — uma mão
('clava','Clava','arma',0,1,'Porrete simples e acessível.','simples','uma_mao','corpo_a_corpo','1d6','x2','nenhum','impacto','{}',false,true,99),
('lanca','Lança','arma',20,1,'Hasta pontiaguda, útil também como arremesso.','simples','uma_mao','corpo_a_corpo','1d6','x2','curto','perfuracao','{arremessavel}',false,true,99),
('maca','Maça','arma',120,1,'Cabeça pesada de ferro.','simples','uma_mao','corpo_a_corpo','1d8','x2','nenhum','impacto','{}',false,true,99),
-- SIMPLES — corpo a corpo — duas mãos
('bordao','Bordão','arma',0,2,'Cajado com pontas em ambas as extremidades.','simples','duas_maos','corpo_a_corpo','1d6/1d6','x2','nenhum','impacto','{dupla}',false,true,99),
('pique','Pique','arma',20,2,'Lança longa de formação.','simples','duas_maos','corpo_a_corpo','1d8','x2','nenhum','perfuracao','{alongada}',false,true,99),
('tacape','Tacape','arma',0,2,'Grande porrete de madeira.','simples','duas_maos','corpo_a_corpo','1d10','x2','nenhum','impacto','{}',false,true,99),
-- SIMPLES — distância
('azagaia','Azagaia','arma',10,1,'Dardo de arremesso leve.','simples','uma_mao','arremesso','1d6','x2','medio','perfuracao','{arremessavel}',false,true,99),
('besta_leve','Besta leve','arma',350,1,'Besta compacta; recarrega com ação de movimento.','simples','uma_mao','disparo','1d8','19','medio','perfuracao','{}',false,false,99),
('funda','Funda','arma',0,1,'Estilingue de couro; aplica Força ao dano.','simples','uma_mao','disparo','1d4','x2','medio','impacto','{}',false,true,99),
('arco_curto','Arco curto','arma',300,2,'Arco ágil para caçadores.','simples','duas_maos','disparo','1d6','x3','medio','perfuracao','{}',false,false,99),
-- MARCIAIS — leves
('gancho','Gancho','arma',30,1,'Gancho de combate.','marcial','leve','corpo_a_corpo','1d4','x4','nenhum','perfuracao','{}',false,false,100),
('khanjar','Khanjar','arma',120,1,'Lâmina curva exótica.','marcial','leve','corpo_a_corpo','1d4','18','nenhum','corte','{}',false,false,100),
('machadinha','Machadinha','arma',60,1,'Machado leve arremessável.','marcial','leve','corpo_a_corpo','1d6','x3','curto','corte','{arremessavel}',false,false,100),
-- MARCIAIS — uma mão
('cimitarra','Cimitarra','arma',150,1,'Lâmina curva ágil.','marcial','uma_mao','corpo_a_corpo','1d6','18','nenhum','corte','{agil}',false,false,100),
('espada_larga','Espada larga','arma',80,1,'Lâmina larga equilibrada.','marcial','uma_mao','corpo_a_corpo','2d4','x2','nenhum','corte','{}',false,false,100),
('espada_longa','Espada longa','arma',150,1,'Espada padrão de aventureiros.','marcial','uma_mao','corpo_a_corpo','1d8','19','nenhum','corte','{}',false,true,100),
('florete','Florete','arma',200,1,'Espada de estoque precisa.','marcial','uma_mao','corpo_a_corpo','1d6','18','nenhum','perfuracao','{agil}',false,false,100),
('maca_estrela','Maça estrela','arma',200,1,'Maça com pontas metálicas.','marcial','uma_mao','corpo_a_corpo','2d4','x2','nenhum','impacto_perfuracao','{}',false,false,100),
('machado_batalha','Machado de batalha','arma',100,1,'Machado de uma mão.','marcial','uma_mao','corpo_a_corpo','1d8','x3','nenhum','corte','{}',false,false,100),
('mangual','Mangual','arma',80,1,'Corrente com bola de ferro.','marcial','uma_mao','corpo_a_corpo','1d8','x2','nenhum','impacto','{versatil}',false,false,100),
('martelo_batalha','Martelo de batalha','arma',120,1,'Martelo de cabeça pesada.','marcial','uma_mao','corpo_a_corpo','1d8','x3','nenhum','impacto','{}',false,false,100),
('picareta','Picareta','arma',80,1,'Ferramenta perfurante de combate.','marcial','uma_mao','corpo_a_corpo','1d6','x4','nenhum','perfuracao','{}',false,false,100),
('tridente','Tridente','arma',150,1,'Três pontas; versátil para derrubar.','marcial','uma_mao','corpo_a_corpo','1d8','x2','nenhum','perfuracao','{versatil}',false,false,100),
-- MARCIAIS — duas mãos
('alabarda','Alabarda','arma',100,2,'Haste com lâmina e gancho.','marcial','duas_maos','corpo_a_corpo','1d10','x3','nenhum','corte_perfuracao','{alongada}',false,false,100),
('alfange','Alfange','arma',750,2,'Grande lâmina curva.','marcial','duas_maos','corpo_a_corpo','2d4','18','nenhum','corte','{}',false,false,100),
('bico_de_corvo','Bico de corvo','arma',150,2,'Haste com cabeça em bico.','marcial','duas_maos','corpo_a_corpo','1d8','x3','nenhum','impacto_perfuracao','{alongada,versatil}',false,false,100),
('gadanho','Gadanho','arma',180,2,'Grande foice de guerra.','marcial','duas_maos','corpo_a_corpo','2d4','x4','nenhum','corte','{}',false,false,100),
('lanca_montada','Lança montada','arma',100,2,'Lança para cavaleiros.','marcial','duas_maos','corpo_a_corpo','1d8','x3','nenhum','perfuracao','{alongada}',false,false,100),
('machado_guerra','Machado de guerra','arma',200,2,'Machado pesado de duas mãos.','marcial','duas_maos','corpo_a_corpo','1d12','x3','nenhum','corte','{}',false,true,100),
('malho','Malho','arma',80,2,'Martelo de devastação.','marcial','duas_maos','corpo_a_corpo','1d10','x2','nenhum','impacto','{versatil}',false,false,100),
('marreta_guerra','Marreta de guerra','arma',200,2,'Marreta maciça.','marcial','duas_maos','corpo_a_corpo','3d4','x2','nenhum','impacto','{desbalanceada}',false,false,100),
('martelo_longo','Martelo longo','arma',120,2,'Martelo de longa haste.','marcial','duas_maos','corpo_a_corpo','2d4','x4','nenhum','impacto_perfuracao','{alongada}',false,false,100),
('montante','Montante','arma',500,2,'Espada enorme de dois gumes.','marcial','duas_maos','corpo_a_corpo','2d6','19','nenhum','corte','{}',false,false,100),
('arco_longo','Arco longo','arma',1000,2,'Arco de alcance superior; aplica Força ao dano.','marcial','duas_maos','disparo','1d8','x3','medio','perfuracao','{desbalanceada}',false,true,100),
('besta_pesada','Besta pesada','arma',500,2,'Besta poderosa; recarga como ação padrão.','marcial','duas_maos','disparo','1d12','19','medio','perfuracao','{}',false,false,100),
-- EXÓTICAS
('chicote','Chicote','arma',20,1,'Chicote longo e flexível.','exotica','uma_mao','corpo_a_corpo','1d3','x2','nenhum','corte','{agil,versatil,alongada}',false,false,101),
('espada_bastarda','Espada bastarda','arma',350,1,'Híbrido entre espada longa e montante.','exotica','uma_mao','corpo_a_corpo','1d10/1d12','19','nenhum','corte','{adaptavel}',false,false,101),
('maca_guerra','Maça de guerra','arma',300,1,'Maça destruidora.','exotica','uma_mao','corpo_a_corpo','1d12','x3','nenhum','impacto','{desbalanceada}',false,false,101),
('machado_anao','Machado anão','arma',300,1,'Machado de fabricação anã.','exotica','uma_mao','corpo_a_corpo','1d10','x3','nenhum','corte','{}',false,false,101),
('rapieira','Rapieira','arma',500,1,'Espada de estoque elegante.','exotica','uma_mao','corpo_a_corpo','1d8','18','nenhum','perfuracao','{agil}',false,false,101),
('sabre_elfico','Sabre élfico','arma',1000,1,'Lâmina élfica aerodinâmica.','exotica','uma_mao','corpo_a_corpo','1d8/1d10','19','nenhum','corte','{adaptavel,agil}',false,false,101),
('corrente_espinhos','Corrente de espinhos','arma',250,2,'Dupla corrente com pontas.','exotica','duas_maos','corpo_a_corpo','2d4/2d4','19','nenhum','corte','{agil,dupla,versatil,alongada}',false,false,101),
('marrao','Marrão','arma',500,2,'Martelo colossal.','exotica','duas_maos','corpo_a_corpo','2d8','x3','nenhum','corte','{desbalanceada}',false,false,101),
('arco_guerra','Arco de guerra','arma',2000,2,'O maior arco existente.','exotica','duas_maos','disparo','1d12','x3','longo','perfuracao','{desbalanceada}',false,false,101),
('arpao','Arpão','arma',300,2,'Arremesso que prende a vítima.','exotica','duas_maos','arremesso','1d10','x3','curto','perfuracao','{}',false,false,101),
('rede','Rede','arma',200,2,'Rede para enredar oponentes.','exotica','duas_maos','arremesso',null,null,'curto',null,'{}',false,false,101),
-- Munição (empilhável)
('virotes_20','Virotes (20)','arma',20,1,'Munição para besta leve.','simples','uma_mao','disparo',null,null,'nenhum',null,'{}',true,true,99),
('pedras_20','Pedras (20)','arma',5,1,'Pedras para funda.','simples','uma_mao','disparo',null,null,'nenhum',null,'{}',true,true,99),
('flechas_20','Flechas (20)','arma',10,1,'Munição para arcos.','simples','duas_maos','disparo',null,null,'nenhum',null,'{}',true,true,99)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  price_pc = excluded.price_pc,
  spaces = excluded.spaces,
  description = excluded.description,
  weapon_proficiency = excluded.weapon_proficiency,
  weapon_grip = excluded.weapon_grip,
  weapon_purpose = excluded.weapon_purpose,
  weapon_damage_dice = excluded.weapon_damage_dice,
  weapon_critical = excluded.weapon_critical,
  weapon_range = excluded.weapon_range,
  weapon_damage_type = excluded.weapon_damage_type,
  weapon_abilities = excluded.weapon_abilities,
  is_stackable = excluded.is_stackable,
  is_starter_eligible = excluded.is_starter_eligible,
  page_ref = excluded.page_ref;
