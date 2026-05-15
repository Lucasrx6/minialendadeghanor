-- Seed de itens do catálogo
-- Execute APÓS migrate_equipment.sql

insert into public.items (slug, name, category, price_pc, spaces, description, weapon_proficiency, weapon_grip, weapon_purpose, weapon_damage_dice, weapon_critical, weapon_range, weapon_damage_type, weapon_abilities, is_stackable, is_starter_eligible, page_ref)
values
-- ARMAS SIMPLES LEVES
('adaga','Adaga','arma',20,1,'Lâmina curta, versátil e fácil de ocultar.','simples','leve','corpo_a_corpo','1d4','19','curto','perfuracao','{arremessavel,discreta,ligeira}',false,true,99),
('espada_curta','Espada curta','arma',100,1,'Lâmina ágil de uma mão, equilíbrio entre alcance e velocidade.','simples','leve','corpo_a_corpo','1d6','19','nenhum','perfuracao','{ligeira}',false,true,99),
('foice','Foice','arma',40,1,'Ferramenta rural adaptada para combate.','simples','leve','corpo_a_corpo','1d6','x3','nenhum','corte','{}',false,true,99),
('punhal','Punhal','arma',60,1,'Adaga robusta, boa para ataques ocultos.','simples','leve','corpo_a_corpo','1d4','19','nenhum','perfuracao','{discreta,ligeira}',false,true,99),
-- ARMAS SIMPLES UMA MÃO
('clava','Clava','arma',0,1,'Porrete reforçado, arma do povo.','simples','uma_mao','corpo_a_corpo','1d6','x2','nenhum','impacto','{}',false,true,99),
('lanca','Lança','arma',20,1,'Haste pontuda de madeira, boa para arremessar.','simples','uma_mao','corpo_a_corpo','1d6','x2','curto','perfuracao','{arremessavel,alongada}',false,true,99),
('maca','Maça','arma',120,1,'Arma de ferro com cabeça pesada.','simples','uma_mao','corpo_a_corpo','1d8','x2','nenhum','impacto','{}',false,true,99),
-- ARMAS SIMPLES DUAS MÃOS
('bordao','Bordão','arma',0,2,'Cajado de madeira com ponta em ambas as extremidades.','simples','duas_maos','corpo_a_corpo','1d6/1d6','x2','nenhum','impacto','{dupla}',false,true,99),
('pique','Pique','arma',20,2,'Lança longa que mantém inimigos à distância.','simples','duas_maos','corpo_a_corpo','1d8','x2','nenhum','perfuracao','{alongada}',false,true,99),
('tacape','Tacape','arma',0,2,'Grande porrete de madeira reforçada.','simples','duas_maos','corpo_a_corpo','1d10','x2','nenhum','impacto','{}',false,true,99),
-- ARMAS SIMPLES DISPARO
('azagaia','Azagaia','arma',10,1,'Dardo de arremesso leve e equilibrado.','simples','uma_mao','disparo','1d6','x2','medio','perfuracao','{arremessavel}',false,true,99),
('besta_leve','Besta leve','arma',350,1,'Besta compacta de fácil operação.','simples','uma_mao','disparo','1d8','19','medio','perfuracao','{}',false,true,99),
('virotes_20','Virotes (20)','arma',20,1,'Munição para besta leve.','simples','uma_mao','disparo',null,null,null,null,'{}',true,true,99),
('funda','Funda','arma',0,1,'Tira de couro para arremessar pedras.','simples','uma_mao','disparo','1d4','x2','medio','impacto','{}',false,true,99),
('pedras_20','Pedras (20)','arma',5,1,'Pedras para funda.','simples','uma_mao','disparo',null,null,null,null,'{}',true,true,99),
('arco_curto','Arco curto','arma',300,2,'Arco ágil para caçadores e arqueiros móveis.','simples','duas_maos','disparo','1d6','x3','medio','perfuracao','{}',false,true,99),
('flechas_20','Flechas (20)','arma',10,1,'Munição padrão para arcos.','simples','duas_maos','disparo',null,null,null,null,'{}',true,true,99),
-- ARMAS MARCIAIS LEVES
('gancho','Gancho','arma',30,1,'Arma pontiaguda em forma de gancho.','marcial','leve','corpo_a_corpo','1d4','x4','nenhum','perfuracao','{versatil}',false,false,100),
('khanjar','Khanjar','arma',120,1,'Lâmina curva de origem exótica, extremamente afiada.','marcial','leve','corpo_a_corpo','1d4','18','nenhum','corte','{ligeira}',false,false,100),
('machadinha','Machadinha','arma',60,1,'Pequeno machado de cabo curto, ótimo para arremessar.','marcial','leve','corpo_a_corpo','1d6','x3','curto','corte','{arremessavel}',false,false,100),
-- ARMAS MARCIAIS UMA MÃO
('cimitarra','Cimitarra','arma',150,1,'Lâmina curva de um fio, elegante e mortal.','marcial','uma_mao','corpo_a_corpo','1d6','18','nenhum','corte','{}',false,false,100),
('espada_larga','Espada larga','arma',80,1,'Lâmina larga de equilíbrio perfeito.','marcial','uma_mao','corpo_a_corpo','2d4','x2','nenhum','corte','{}',false,false,100),
('espada_longa','Espada longa','arma',150,1,'A espada padrão de cavaleiros e aventureiros.','marcial','uma_mao','corpo_a_corpo','1d8','19','nenhum','corte','{adaptavel}',false,true,100),
('florete','Florete','arma',200,1,'Espada estocada, leve e precisa.','marcial','uma_mao','corpo_a_corpo','1d6','18','nenhum','perfuracao','{ligeira}',false,false,100),
('maca_estrela','Maça estrela','arma',200,1,'Arma de golpe com pontas metálicas.','marcial','uma_mao','corpo_a_corpo','2d4','x2','nenhum','impacto_perfuracao','{}',false,false,100),
('machado_batalha','Machado de batalha','arma',100,1,'Machado robusto de uma mão.','marcial','uma_mao','corpo_a_corpo','1d8','x3','nenhum','corte','{}',false,false,100),
('mangual','Mangual','arma',80,1,'Corrente com bola de ferro, difícil de defender.','marcial','uma_mao','corpo_a_corpo','1d8','x2','nenhum','impacto','{versatil}',false,false,100),
('martelo_batalha','Martelo de batalha','arma',120,1,'Martelo de cabeça pesada, esmaga armaduras.','marcial','uma_mao','corpo_a_corpo','1d8','x3','nenhum','impacto','{}',false,false,100),
('picareta','Picareta','arma',80,1,'Arma pontiaguda que penetra armaduras pesadas.','marcial','uma_mao','corpo_a_corpo','1d6','x4','nenhum','perfuracao','{}',false,false,100),
('tridente','Tridente','arma',150,1,'Arma de três pontas para combate e arremesso.','marcial','uma_mao','corpo_a_corpo','1d8','x2','nenhum','perfuracao','{arremessavel}',false,false,100),
-- ARMAS MARCIAIS DUAS MÃOS
('alabarda','Alabarda','arma',100,2,'Haste com lâmina e gancho, versátil em combate.','marcial','duas_maos','corpo_a_corpo','1d10','x3','nenhum','corte_perfuracao','{alongada,versatil}',false,false,100),
('alfange','Alfange','arma',750,2,'Grande lâmina curva de alta qualidade.','marcial','duas_maos','corpo_a_corpo','2d4','18','nenhum','corte','{}',false,false,100),
('bico_de_corvo','Bico de corvo','arma',150,2,'Arma de haste com cabeça em forma de bico.','marcial','duas_maos','corpo_a_corpo','1d8','x3','nenhum','impacto_perfuracao','{}',false,false,100),
('gadanho','Gadanho','arma',180,2,'Grande foice de guerra com alcance superior.','marcial','duas_maos','corpo_a_corpo','2d4','x4','nenhum','corte','{alongada}',false,false,100),
('lanca_montada','Lança montada','arma',100,2,'Lança para cavaleiros em carga montada.','marcial','duas_maos','corpo_a_corpo','1d8','x3','nenhum','perfuracao','{alongada}',false,false,100),
('machado_guerra','Machado de guerra','arma',200,2,'Pesado machado de dois gumes.','marcial','duas_maos','corpo_a_corpo','1d12','x3','nenhum','corte','{}',false,true,100),
('malho','Malho','arma',80,2,'Grande martelo de devastação.','marcial','duas_maos','corpo_a_corpo','1d10','x2','nenhum','impacto','{}',false,false,100),
('marreta_guerra','Marreta de guerra','arma',200,2,'Marreta maciça para destruir proteções.','marcial','duas_maos','corpo_a_corpo','3d4','x2','nenhum','impacto','{}',false,false,100),
('martelo_longo','Martelo longo','arma',120,2,'Martelo de longa haste com pontas.','marcial','duas_maos','corpo_a_corpo','2d4','x4','nenhum','impacto_perfuracao','{alongada}',false,false,100),
('montante','Montante','arma',500,2,'Enorme espada de dois gumes, símbolo de poder.','marcial','duas_maos','corpo_a_corpo','2d6','19','nenhum','corte','{}',false,false,100),
('arco_longo','Arco longo','arma',1000,2,'Arco de alcance superior, exige força e treino.','marcial','duas_maos','disparo','1d8','x3','medio','perfuracao','{}',false,false,100),
('besta_pesada','Besta pesada','arma',500,2,'Besta de alto dano, lenta para recarregar.','marcial','duas_maos','disparo','1d12','19','medio','perfuracao','{}',false,false,100),
-- ARMAS EXÓTICAS UMA MÃO
('chicote','Chicote','arma',20,1,'Longa tira de couro endurecido com ponta cortante.','exotica','uma_mao','corpo_a_corpo','1d3','x2','nenhum','corte','{alongada}',false,false,101),
('espada_bastarda','Espada bastarda','arma',350,1,'Híbrido entre espada longa e grande espada.','exotica','uma_mao','corpo_a_corpo','1d10/1d12','19','nenhum','corte','{adaptavel}',false,false,101),
('maca_guerra','Maça de guerra','arma',300,1,'Versão maior e mais destruidora da maça comum.','exotica','uma_mao','corpo_a_corpo','1d12','x3','nenhum','impacto','{}',false,false,101),
('machado_anao','Machado anão','arma',300,1,'Machado de fabricação anã, dano excepcional.','exotica','uma_mao','corpo_a_corpo','1d10','x3','nenhum','corte','{}',false,false,101),
('rapieira','Rapieira','arma',500,1,'Espada de estoque elegante, preferida de nobres.','exotica','uma_mao','corpo_a_corpo','1d8','18','nenhum','perfuracao','{ligeira}',false,false,101),
('sabre_elfico','Sabre élfico','arma',1000,1,'Lâmina aeróbica de manufatura élfica.','exotica','uma_mao','corpo_a_corpo','1d8/1d10','19','nenhum','corte','{adaptavel}',false,false,101),
-- ARMAS EXÓTICAS DUAS MÃOS
('corrente_espinhos','Corrente de espinhos','arma',250,2,'Dupla corrente com pontas afiadas em ambas as pontas.','exotica','duas_maos','corpo_a_corpo','2d4/2d4','19','nenhum','corte','{dupla,alongada}',false,false,101),
('marrao','Marrão','arma',500,2,'Colossal martelo de dois gumes com dano devastador.','exotica','duas_maos','corpo_a_corpo','2d8','x3','nenhum','corte','{}',false,false,101),
-- ARMAS EXÓTICAS DISTÂNCIA
('arco_guerra','Arco de guerra','arma',2000,2,'O maior arco existente, precisa de força sobre-humana.','exotica','duas_maos','disparo','1d12','x3','longo','perfuracao','{}',false,false,101),
('arpao','Arpão','arma',300,2,'Arma de arremesso que prende a vítima com cordas.','exotica','duas_maos','disparo','1d10','x3','curto','perfuracao','{}',false,false,101),
('rede','Rede','arma',200,2,'Rede de arremesso para aprisionar oponentes.','exotica','duas_maos','disparo',null,null,'curto',null,'{}',false,false,101)
on conflict (slug) do update set
  name = excluded.name,
  price_pc = excluded.price_pc;
