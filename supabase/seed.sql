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
-- Seed: Armaduras, Escudos e Itens Gerais
-- Execute APÓS migrate_equipment.sql e seed_items_weapons.sql

-- ─── ARMADURAS LEVES ──────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, armor_category, armor_defense_bonus, armor_penalty, is_starter_eligible, page_ref)
values
('armadura_acolchoada','Armadura acolchoada','armadura',50,2,'Proteção de tecido grosso e acolchoado, leve mas pouco eficaz.','leve',1,0,true,109),
('armadura_couro','Armadura de couro','armadura',200,2,'Peças de couro endurecido que cobrem o torso e membros.','leve',2,0,true,109),
('couro_batido','Couro batido','armadura',350,2,'Couro temperado e endurecido por processos especiais.','leve',3,-1,true,109),
('gibao_peles','Gibão de peles','armadura',250,2,'Grossa proteção feita de peles de animais.','leve',4,-3,true,109),
('cota_aneis','Cota de anéis','armadura',2500,2,'Anéis metálicos entrelaçados sobre uma base de couro.','leve',5,-2,false,109),
-- ARMADURAS PESADAS
('brunea','Brunea','armadura',500,5,'Proteção metálica completa, o padrão entre soldados.','pesada',5,-2,true,109),
('cota_malha','Cota de malha','armadura',1500,5,'Malha de metal entretecida que cobre o corpo todo.','pesada',6,-2,false,109),
('cota_talas','Cota de talas','armadura',2500,5,'Talas metálicas sobre base de couro resistente.','pesada',7,-3,false,109),
('meia_armadura','Meia armadura','armadura',6000,5,'Proteção de placas cobrindo os pontos vitais.','pesada',8,-4,false,109),
('armadura_completa','Armadura completa','armadura',30000,5,'A proteção definitiva, que cobre cada centímetro do corpo.','pesada',10,-5,false,109),
-- ESCUDOS
('escudo_leve','Escudo leve','escudo',50,1,'Escudo de madeira reforçada com metal nas bordas.','escudo_leve',1,-1,true,109),
('escudo_pesado','Escudo pesado','escudo',150,2,'Grande escudo de metal que cobre boa parte do corpo.','escudo_pesado',2,-2,false,109),
('escudo_torre','Escudo torre','escudo',450,2,'Escudo enorme que praticamente esconde o portador.','escudo_torre',2,-4,false,109)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── EQUIPAMENTO DE AVENTURA ─────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, is_starter_eligible, page_ref)
values
('agua_benta','Água benta','equipamento_aventura',100,0.5,'Água consagrada que repele mortos-vivos e criaturas das trevas.',true,false,112),
('agua_sacra','Água sacra','equipamento_aventura',500,0.5,'Versão potente da água benta, usada em rituais sagrados.',true,false,112),
('algemas','Algemas','equipamento_aventura',150,1,'Manilhas de ferro para prender prisioneiros.',false,false,112),
('arpeu','Arpéu','equipamento_aventura',50,1,'Gancho de ferro com corda para escalar ou prender.',false,false,112),
('bandoleira_pocoes','Bandoleira de poções','equipamento_aventura',200,1,'Coldre especial para carregar frascos com acesso rápido.',false,false,112),
('barraca','Barraca','equipamento_aventura',100,1,'Abrigo leve para uma ou duas pessoas em campo.',false,true,112),
('bolsa_lona','Bolsa de lona','equipamento_aventura',20,0,'Bolsa resistente para carregar equipamentos variados.',false,true,112),
('corda','Corda (15m)','equipamento_aventura',10,1,'Corda resistente de 15 metros, essencial para aventureiros.',false,true,112),
('espelho','Espelho de bolso','equipamento_aventura',100,1,'Pequeno espelho de metal polido, útil em várias situações.',false,false,112),
('estrepes','Estrepes','equipamento_aventura',50,1,'Pontas de ferro espalhadas no chão para dificultar perseguições.',true,false,112),
('lampiao','Lampião','equipamento_aventura',70,1,'Lanterna fechada que resiste ao vento.',false,false,112),
('mapa','Mapa','equipamento_aventura',300,1,'Mapa detalhado de uma região específica.',false,false,112),
('mochila','Mochila','equipamento_aventura',500,0,'Mochila resistente de couro para carregar equipamentos.',false,true,112),
('oleo','Óleo (0,5l)','equipamento_aventura',1,0.5,'Combustível para lampião, dura cerca de 6 horas.',true,true,112),
('pe_de_cabra','Pé de cabra','equipamento_aventura',20,1,'Barra de ferro para forçar portas e tampas.',false,false,112),
('pederneira','Pederneira','equipamento_aventura',10,1,'Kit para acender fogueiras em qualquer condição.',false,true,112),
('racao_viagem','Ração de viagem','equipamento_aventura',10,0.5,'Comida seca e preservada para uma semana de viagem.',true,true,112),
('saco_dormir','Saco de dormir','equipamento_aventura',10,1,'Rolo de tecido grosso para dormir em campo.',false,true,112),
('simbolo_sagrado','Símbolo sagrado','equipamento_aventura',50,1,'Amuleto ou símbolo da divindade do personagem.',false,true,112),
('tocha','Tocha','equipamento_aventura',1,1,'Vara com ponta embebida em alcatrão, ilumina por horas.',true,true,112),
('vara_madeira','Vara de madeira (3m)','equipamento_aventura',2,1,'Vara resistente de três metros de comprimento.',false,false,112)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── FERRAMENTAS ─────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('ferramentas_ladrao','Ferramentas de ladrão','ferramenta',300,1,'Kit com chaves falsas, arame e picks para abrir fechaduras.',true,115),
('instrumentos_oficio','Instrumentos de ofício','ferramenta',300,1,'Ferramentas de trabalho para um ofício específico (escolha ao comprar).',false,115),
('instrumento_musical','Instrumento musical','ferramenta',350,1,'Instrumento musical de qualidade média (escolha ao comprar).',true,115),
('luneta','Luneta','ferramenta',1000,1,'Instrumento óptico para observar objetos e pessoas à distância.',false,115),
('maleta_medicamentos','Maleta de medicamentos','ferramenta',500,1,'Conjunto de remédios e bandagens para tratar ferimentos.',true,115),
('estojo_disfarces','Estojo de disfarces','ferramenta',500,1,'Cosméticos, perucas e acessórios para mudanças de aparência.',false,115)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── VESTUÁRIO ───────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('traje_viajante','Traje de viajante','vestuario',100,0,'Roupa confortável e resistente para longas jornadas. Não conta para o limite de espaços.',true,116),
('elmo_leve','Elmo leve','vestuario',150,1,'Capacete de metal leve que protege a cabeça sem limitar a visão.',false,116),
('elmo_pesado','Elmo pesado','vestuario',2000,1,'Capacete fechado de metal pesado com visor.',false,116),
('capa_pesada','Capa pesada','vestuario',150,1,'Capa grossa que protege do frio e da chuva.',true,116),
('botas_reforcadas','Botas reforçadas','vestuario',200,1,'Botas de couro com sola grossa, ideais para longas caminhadas.',true,116),
('luva_pelica','Luva de pelica','vestuario',50,1,'Luvas de couro macio e bem acabado.',false,116),
('traje_corte','Traje de corte','vestuario',1000,1,'Roupa elegante para eventos e audiências na nobreza.',false,116),
('manto_eclesiastico','Manto eclesiástico','vestuario',200,1,'Vestes de clérigo que demonstram devoção à divindade.',false,116),
('robe_mago','Robe de mago','vestuario',500,1,'Robe com bolsos internos e adornos mágicos.',true,116)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ESOTÉRICOS ──────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('cajado_arcano','Cajado arcano','esoterico',10000,2,'Foco mágico na forma de cajado, amplifica magias de conjuradores.',true,117),
('varinha_arcana','Varinha arcana','esoterico',1000,1,'Foco mágico compacto para conjuradores habilidosos.',true,117),
('orbe_cristalina','Orbe cristalina','esoterico',7500,1,'Esfera de cristal que serve de foco para magias arcanas.',false,117),
('tomo_hermetico','Tomo hermético','esoterico',15000,1,'Livro de feitiços com proteção mágica contra leitura não autorizada.',false,117),
('simbolo_sagrado_ouro','Símbolo sagrado de ouro','esoterico',7500,1,'Versão preciosa do símbolo sagrado, com maior potência ritual.',false,117),
('bolsa_po','Bolsa de pó','esoterico',3000,1,'Bolsa com componentes materiais para magias variadas.',false,117)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUÍMICOS PREPARADOS ────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, is_starter_eligible, page_ref)
values
('acido','Ácido','alquimico_preparado',100,0.5,'Frasco de ácido corrosivo que causa dano em área pequena.',true,false,118),
('antidoto','Antídoto','alquimico_preparado',150,0.5,'Contraveneno básico que neutraliza a maioria dos venenos comuns.',true,true,118),
('balsamo_restaurador','Bálsamo restaurador','alquimico_preparado',100,0.5,'Ungüento que acelera a cura natural de ferimentos leves.',true,true,118),
('essencia_mana','Essência de mana','alquimico_preparado',500,0.5,'Líquido prateado que restaura pontos de mana quando ingerido.',true,false,118),
('fogo_alquimico','Fogo alquímico','alquimico_preparado',100,0.5,'Substância inflamável que queima mesmo em superfícies molhadas.',true,false,118)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUÍMICOS VENENOS ───────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, page_ref)
values
('peconha_comum','Peçonha comum','alquimico_veneno',150,0.5,'Veneno de efeito leve que causa mal-estar e fraqueza.',true,119),
('cicuta','Cicuta','alquimico_veneno',600,0.5,'Extrato vegetal tóxico que provoca paralisia progressiva.',true,119),
('bruma_sonolenta','Bruma sonolenta','alquimico_veneno',1500,0.5,'Vapor que causa sonolência intensa quando inalado.',true,119),
('beladona','Beladona','alquimico_veneno',15000,0.5,'Veneno de alta potência extraído de planta rara.',true,119)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ANIMAIS ─────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('cavalo','Cavalo','animal',750,0,'Cavalo de montaria padrão para viagens terrestres.',121),
('cavalo_guerra','Cavalo de guerra','animal',4000,0,'Cavalo treinado para combate, mais resistente e agressivo.',121),
('mula','Mula','animal',600,0,'Animal de carga resistente, pode carregar mais peso que um cavalo.',121),
('cao_caca','Cão de caça','animal',1500,0,'Cão treinado para rastrear e auxiliar em caçadas.',121),
('sela','Sela','animal',200,0,'Equipamento para montaria confortável em cavalos.',121)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── SERVIÇOS ────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('hospedagem_comum','Hospedagem comum (noite)','servico',10,0,'Quarto simples em estalagem, inclui café da manhã.',122),
('hospedagem_confortavel','Hospedagem confortável (noite)','servico',40,0,'Quarto privado em boa estalagem, refeições incluídas.',122),
('alimentacao_comum','Alimentação comum (refeição)','servico',2,0,'Refeição simples e nutritiva em taberna local.',122),
('curandeiro','Curandeiro (tratamento)','servico',50,0,'Serviços de curador para tratar ferimentos e doenças.',122),
('mensageiro','Mensageiro (por km)','servico',5,0,'Serviço de entrega de mensagens a pé ou a cavalo.',122)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;
-- Seed: Catálogo expandido — Prompt 4/4
-- Adiciona ~128 itens em categorias novas ou incompletas.
-- Execute APÓS seed_items_general.sql e migrate_purchasable.sql.
-- Valide com: npm run validate:seed
-- Audite com: npm run audit:catalog

-- ─── ANIMAL (falcão, faltava no catálogo) ────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('falcao','Falcão de caça','animal',800,0,'Falcão treinado para vigilância e caça; pode ser enviado como mensageiro.',121)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── BENS COMUNS (24) ────────────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, is_starter_eligible, page_ref)
values
('vela','Vela','bens_comuns',1,0.5,'Vela de cera para iluminação básica, dura cerca de 2 horas.',true,true,113),
('giz','Giz','bens_comuns',1,0,'Bastão de giz para escrever em pedra ou madeira.',true,true,113),
('tinta','Tinta (frasco)','bens_comuns',5,0.5,'Frasco de tinta negra para escrita e marcação.',false,true,113),
('pena_escrita','Pena de escrita','bens_comuns',1,0,'Pena de ave para escrita com tinta.',false,true,113),
('papel','Papel (10 folhas)','bens_comuns',10,0.5,'Papel de qualidade média para correspondências e anotações.',true,true,113),
('livro_branco','Livro em branco','bens_comuns',50,1,'Livro encadernado com páginas em branco para diário ou registros.',false,false,113),
('cera_lacre','Cera de lacre','bens_comuns',5,0.5,'Cera colorida para selar correspondências e documentos.',false,false,113),
('cadeado','Cadeado de ferro','bens_comuns',20,0.5,'Cadeado robusto para trancar baús e portões; requer chave.',false,false,113),
('corrente','Corrente de ferro (1m)','bens_comuns',10,1,'Corrente metálica resistente de um metro.',false,false,113),
('argola_ferro','Argola de ferro','bens_comuns',2,0,'Argola de ferro para amarrar, prender e construir armadilhas.',true,false,113),
('prego','Pregos (dúzia)','bens_comuns',1,0,'Dúzia de pregos de ferro para carpintaria e construção.',true,false,113),
('martelo_carpinteiro','Martelo de carpinteiro','bens_comuns',10,1,'Martelo simples para pregar e construção básica.',false,false,113),
('cinzel','Cinzel','bens_comuns',5,0.5,'Ferramenta de metal para esculpir madeira e pedra.',false,false,113),
('pa','Pá','bens_comuns',10,1,'Pá de ferro para cavar e mover terra.',false,false,113),
('picareta_trabalho','Picareta de trabalho','bens_comuns',15,2,'Picareta pesada para quebrar rocha e solo duro.',false,false,113),
('agulha_linha','Agulha e linha','bens_comuns',5,0,'Kit de costura básico para reparar roupas e equipamentos.',false,true,113),
('pano','Pano (2m)','bens_comuns',5,0.5,'Tecido simples de linho para embrulhar, limpar e reparar.',true,true,113),
('cesto','Cesto de vime','bens_comuns',10,1,'Cesto trançado para carregar provisões e itens variados.',false,false,113),
('barril_pequeno','Barrilinho (10l)','bens_comuns',20,2,'Barril pequeno de madeira para armazenar líquidos.',false,false,113),
('caixote','Caixote de madeira','bens_comuns',15,2,'Caixote rústico para transporte e armazenamento de mercadorias.',false,false,113),
('saco_estopa','Saco de estopa','bens_comuns',2,1,'Saco grosseiro de fibra para carregar grãos e objetos variados.',false,true,113),
('cobertor','Cobertor','bens_comuns',10,1,'Cobertor de lã para dormidas fora de estalagens.',false,true,113),
('sabao','Sabão','bens_comuns',5,0.5,'Barra de sabão para higiene e limpeza de equipamentos.',true,true,113),
('arame','Arame (3m)','bens_comuns',5,0.5,'Fio metálico flexível para armadilhas, amarras e reparos.',false,false,113)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUÍMICO CATALISADOR (15) ───────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, page_ref)
values
('po_enxofre','Pó de enxofre','alquimico_catalisador',20,0.5,'Pó amarelo inflamável; componente de muitas reações alquímicas.',true,118),
('mercurio','Mercúrio (frasco)','alquimico_catalisador',50,0.5,'Metal líquido prateado, catalisador essencial em alquimia avançada.',true,118),
('sal_magico','Sal mágico','alquimico_catalisador',30,0.5,'Cristais de sal imbuídos de energia mágica residual.',true,118),
('areia_vitrea','Areia vítrea','alquimico_catalisador',15,0.5,'Areia transformada em vidro por alta temperatura; usada em transmutações.',true,118),
('sangue_dragao','Sangue de dragão (resina)','alquimico_catalisador',200,0.5,'Resina carmesim com propriedades mágicas intensas; rara.',true,118),
('po_osso','Pó de osso','alquimico_catalisador',10,0.5,'Ossos moídos até virarem pó fino; usado em preparações de necromancia leve.',true,118),
('carvao_ativado','Carvão ativado','alquimico_catalisador',5,0.5,'Carvão poroso de alta absorção; redução e filtragem alquímica.',true,118),
('oleo_essencial','Óleo essencial','alquimico_catalisador',40,0.5,'Óleo concentrado de ervas aromáticas para catálise e fixação.',true,118),
('cristal_sal','Cristal de sal','alquimico_catalisador',25,0.5,'Formação cristalina salina de alta pureza para reações de estabilização.',true,118),
('pena_corvo','Pena de corvo','alquimico_catalisador',15,0,'Pena negra imbuída de propriedades de percepção e presságio.',true,118),
('olho_sapo','Olho de sapo (seco)','alquimico_catalisador',30,0,'Componente para elixires de transformação e venenos de paralisia.',true,118),
('teia_concentrada','Teia de aranha concentrada','alquimico_catalisador',60,0.5,'Teia processada e comprimida para uso em alquimia de imobilização.',true,118),
('mel_selvagem','Mel selvagem','alquimico_catalisador',25,0.5,'Mel coletado de colmeias silvestres com propriedades curativas leves.',true,118),
('musgo_luminoso','Musgo luminoso','alquimico_catalisador',80,0.5,'Musgo que emite suave brilho azulado; componente de poções de visão.',true,118),
('pedra_enxofre','Pedra de enxofre','alquimico_catalisador',35,0.5,'Minério de enxofre bruto para reações de combustão e fumigação.',true,118)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUIMIA MÍSTICA (11) ────────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, page_ref)
values
('pocao_cura_menor','Poção de cura menor','alquimia_mistica',300,0.5,'Restaura 1d6+1 pontos de vida quando ingerida. Sabor de mel e ervas.',true,118),
('pocao_cura','Poção de cura','alquimia_mistica',800,0.5,'Restaura 2d6+3 pontos de vida quando ingerida. Cor âmbar viva.',true,118),
('pocao_cura_maior','Poção de cura maior','alquimia_mistica',2000,0.5,'Restaura 3d6+5 pontos de vida quando ingerida. Cor dourada intensa.',true,118),
('elixir_forca','Elixir de força','alquimia_mistica',500,0.5,'Concede +2 em testes de Força por 1 hora. Gosto metálico amargo.',true,118),
('elixir_destreza','Elixir de destreza','alquimia_mistica',500,0.5,'Concede +2 em testes de Destreza por 1 hora. Formiga levemente.',true,118),
('elixir_resistencia','Elixir de resistência','alquimia_mistica',500,0.5,'Concede +2 em testes de Constituição por 1 hora. Sabor amargo de raízes.',true,118),
('oleo_magico','Óleo mágico','alquimia_mistica',400,0.5,'Aplicado em arma ou ferramenta, concede +1 de dano por 10 minutos.',true,118),
('po_sono','Pó do sono','alquimia_mistica',300,0.5,'Inalado: alvo testa Constituição (CD 14) ou cai em sono profundo por 1h.',true,118),
('po_visao','Pó da visão','alquimia_mistica',600,0.5,'Inalado: concede visão no escuro por 1 hora e +2 em testes de Percepção.',true,118),
('frasco_fumaca','Frasco de fumaça','alquimia_mistica',150,0.5,'Ao quebrar, cria nuvem de fumaça espessa (3m de raio) por 1 minuto.',true,118),
('tintura_invisivel','Tintura invisível','alquimia_mistica',1500,0.5,'Aplicada ao corpo, concede invisibilidade por 1 rodada ou até atacar.',true,118)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── VEÍCULOS (3) ─────────────────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('carrocinha','Carrocinha','veiculo',500,0,'Pequena carroça aberta puxada por um animal, carrega até 20 espaços de carga.',121),
('charrete','Charrete','veiculo',1500,0,'Charrete semi-coberta puxada por dois animais, comporta até 4 passageiros.',121),
('carruagem','Carruagem','veiculo',5000,0,'Carruagem fechada e confortável para viagens longas, até 6 passageiros.',121)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ITENS MÁGICOS (15) — Bazar Arcano ───────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('anel_protecao','Anel de proteção','item_magico',5000,0,'Concede +1 de bônus de Defesa permanente enquanto estiver no dedo.',122),
('amuleto_saude','Amuleto da saúde','item_magico',3000,0,'Aumenta em 5 os pontos de vida máximos do portador.',122),
('botas_velozes','Botas velozes','item_magico',4000,1,'Aumenta o deslocamento base em +3m.',122),
('capa_sombra','Capa das sombras','item_magico',6000,1,'Concede +2 de bônus em testes de Furtividade.',122),
('luvas_forca','Luvas de força','item_magico',4000,0,'Concede +1 de bônus em testes de Força enquanto vestidas.',122),
('elmo_percepcao','Elmo da percepção','item_magico',3500,1,'Concede +2 de bônus em testes de Iniciativa.',122),
('anel_resistencia','Anel de resistência','item_magico',4500,0,'Concede +2 de bônus em todos os testes de resistência.',122),
('cinto_forca','Cinto de força','item_magico',8000,0,'Concede +2 de bônus na Força enquanto usado.',122),
('talisman_coragem','Talismã da coragem','item_magico',5000,0,'O portador é imune ao efeito de Medo enquanto carregar o talismã.',122),
('bolsa_guardadora','Bolsa guardadora','item_magico',10000,0,'Armazena até 20 espaços de itens mas pesa 0 para o portador.',122),
('pedra_chamado','Pedra de chamado','item_magico',8000,0,'Par de pedras vinculadas: permite comunicação telepática em até 1 km.',122),
('vela_revelacao','Vela da revelação','item_magico',2000,0,'Ao acender, detecta magia e ilusões ativas em raio de 6m por 10 min.',122),
('manto_invisibilidade','Manto de invisibilidade','item_magico',15000,1,'Concede invisibilidade por até 10 minutos por dia (uso fracionado).',122),
('cristal_memoria','Cristal de memória','item_magico',12000,0,'Armazena até 3 magias por até 24 horas para uso posterior.',122),
('espelho_visoes','Espelho de visões','item_magico',20000,2,'Permite observar remotamente um local conhecido 1 vez por dia.',122)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── VESTUÁRIO adicional (+16) ────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('chapeu_aventureiro','Chapéu de aventureiro','vestuario',80,0,'Chapéu largo de couro que protege do sol e da chuva.',true,116),
('manto_comum','Manto comum','vestuario',50,0,'Manto simples de lã para clima frio.',true,116),
('manto_nobre','Manto nobre','vestuario',500,0,'Manto de tecido fino com detalhes bordados, símbolo de status.',false,116),
('manto_inverno','Manto de inverno','vestuario',200,1,'Manto espesso com capuz e forro de pele para clima muito frio.',false,116),
('tunica','Túnica simples','vestuario',30,0,'Vestimenta básica de linho ou algodão, adequada para qualquer ocasião.',true,116),
('calcas_couro','Calças de couro','vestuario',100,0,'Calças resistentes de couro curtido, duráveis para aventuras.',true,116),
('camisa_seda','Camisa de seda','vestuario',300,0,'Camisa luxuosa de seda fina, impressionante em ambientes nobres.',false,116),
('sandalia','Sandálias','vestuario',20,0,'Calçado simples de couro para clima quente.',true,116),
('botas_altas','Botas de cano alto','vestuario',300,0,'Botas de couro de cano alto, resistentes e impermeáveis.',false,116),
('capuz_la','Capuz de lã','vestuario',30,0,'Capuz simples que protege cabeça e pescoço do frio.',true,116),
('luvas_couro','Luvas de couro','vestuario',50,0,'Luvas de couro duro para trabalho, proteção e montaria.',false,116),
('cinto_simples','Cinto simples','vestuario',20,0,'Cinto de couro para prender vestes e pendurar pequenos objetos.',true,116),
('cinta_abdominal','Cinta abdominal','vestuario',100,0,'Tira larga de couro reforçado para proteger o abdômen.',false,116),
('traje_trabalho','Traje de trabalho','vestuario',80,0,'Roupa resistente para trabalho pesado no campo ou em oficinas.',true,116),
('uniforme_guarda','Uniforme de guarda','vestuario',200,0,'Uniforme padronizado de soldado ou guarda da cidade.',false,116),
('roupa_disfarce','Roupa de disfarce','vestuario',150,0,'Conjunto de roupas neutras e acessórios para misturar-se à multidão.',false,116)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── FERRAMENTAS adicionais (+8) ─────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('kit_escalada','Kit de escalada','ferramenta',300,2,'Pitons, marreta, mosquetões e corda curta para escalar paredes e penhascos.',false,115),
('kit_cirurgiao','Kit de cirurgião','ferramenta',800,1,'Bisturis, pinças, agulha e fio cirúrgico para operações de emergência.',false,115),
('kit_cartografia','Kit de cartografia','ferramenta',200,1,'Instrumentos, compasso e tinta especial para criar e copiar mapas com precisão.',false,115),
('kit_alquimia','Kit de alquimia','ferramenta',1000,2,'Alambiques, frascos de vidro e instrumentos para produzir itens alquímicos.',false,115),
('kit_joalheria','Kit de joalheria','ferramenta',1500,1,'Ferramentas de precisão para lapidação e trabalho com pedras preciosas.',false,115),
('kit_culinaria','Kit de culinária','ferramenta',150,1,'Panelas, talheres, especiarias e fogão portátil para cozinhar no campo.',true,115),
('kit_ferraria','Kit de ferraria','ferramenta',500,3,'Tenaz, martelo de forja, lima e fole portátil para trabalho básico com metal.',false,115),
('bussola','Bússola','ferramenta',200,0,'Instrumento magnético para orientação em campo; sempre aponta para o norte.',false,115)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ESOTÉRICO adicional (+9) ─────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_starter_eligible, page_ref)
values
('incenso_concentracao','Incenso de concentração','esoterico',200,0.5,'Queimado durante meditação, reduz o tempo de recuperação de mana em 10 min.',false,117),
('vela_ritual','Vela ritual','esoterico',100,0.5,'Vela imbuída de energia mágica; necessária para certos rituais e magias.',true,117),
('cristal_foco','Cristal de foco','esoterico',2000,1,'Cristal lapidado que amplifica magias de foco e concentração.',false,117),
('pedra_runa','Pedra rúnica','esoterico',500,0,'Pedra gravada com runas de poder para uso em rituais e invocações.',false,117),
('grimorio','Grimório','esoterico',5000,1,'Livro de feitiços encadernado em couro, com páginas imbuídas de proteção mágica.',false,117),
('pergaminho_magia','Pergaminho de magia','esoterico',300,0,'Pergaminho com uma magia inscrita de 1º círculo, de uso único.',true,117),
('talisman_sorte','Talismã da sorte','esoterico',1000,0,'Amuleto encantado que concede um relançamento de dado por sessão.',false,117),
('ampola_arcana','Ampola arcana','esoterico',800,0.5,'Recipiente de vidro reforçado magicamente para armazenar energia arcana.',false,117),
('diapasao_magico','Diapasão mágico','esoterico',1500,1,'Vibra ao detectar portais e campos mágicos ativos em raio de 10m.',false,117)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUÍMICO VENENO adicional (+9) ─────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, page_ref)
values
('peconha_vibora','Peçonha de víbora','alquimico_veneno',500,0.5,'Veneno de serpente que causa fraqueza muscular progressiva.',true,119),
('peconha_escorpiao','Peçonha de escorpião','alquimico_veneno',800,0.5,'Toxina de escorpião que provoca dores intensas e paralisia parcial.',true,119),
('peconha_aranha','Peçonha de aranha','alquimico_veneno',400,0.5,'Veneno necrótico que danifica tecidos lentamente ao longo de horas.',true,119),
('veneno_paralisante','Veneno paralisante','alquimico_veneno',2000,0.5,'Composto sintético que paralisa completamente a vítima por 1 hora.',true,119),
('toxina_mental','Toxina mental','alquimico_veneno',3000,0.5,'Veneno sutil que nubla os sentidos e prejudica tomada de decisões.',true,119),
('po_contaminado','Pó contaminado','alquimico_veneno',600,0.5,'Pó fino que causa doença grave quando inalado.',true,119),
('oleo_cogumelo','Óleo de cogumelo','alquimico_veneno',1200,0.5,'Extrato de cogumelo tóxico incolor e inodoro, imperceptível em bebidas.',true,119),
('peconha_sapo','Peçonha de sapo-dardo','alquimico_veneno',5000,0.5,'Veneno violento extraído de sapos exóticos; letal em pequenas quantidades.',true,119),
('amargura_haste','Amargura da haste','alquimico_veneno',10000,0.5,'Veneno de planta raríssima; causa dano severo à saúde ao longo de dias.',true,119)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── ALQUÍMICO PREPARADO adicional (+3) ───────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, is_starter_eligible, page_ref)
values
('fumaca_grossa','Fumaça grossa','alquimico_preparado',80,0.5,'Frasco que ao quebrar cria nuvem de fumaça densa em 2m de raio por 3 rodadas.',true,false,118),
('oleo_escorregadio','Óleo escorregadio','alquimico_preparado',50,0.5,'Ao derramar no chão, cria zona escorregadia em 1m de raio por 1 minuto.',true,false,118),
('balsamo_curativo','Bálsamo curativo','alquimico_preparado',200,0.5,'Versão reforçada do bálsamo; restaura 2d4+2 PV ao ser aplicado externamente.',true,false,118)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── SERVIÇOS adicionais (+11) ────────────────────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, page_ref)
values
('hospedagem_luxuosa','Hospedagem luxuosa (noite)','servico',200,0,'Suíte em estalagem nobre; refeições finas, banho quente e estábulo incluídos.',122),
('banho_cuidados','Banho e cuidados (sessão)','servico',20,0,'Banho quente, barbeiro ou massagem em estabelecimento local.',122),
('ferreiro_reparo','Ferreiro (reparo simples)','servico',50,0,'Reparo de arma ou armadura levemente danificada pelo ferreiro local.',122),
('alfaiate_servico','Alfaiate (conserto)','servico',20,0,'Conserto de vestimenta rasgada ou ajuste de medidas em roupas.',122),
('escriba','Escriba (por documento)','servico',30,0,'Redação ou cópia de cartas, contratos e documentos por escriba profissional.',122),
('guarda_costas_dia','Guarda-costas (por dia)','servico',150,0,'Mercenário experiente contratado para proteção pessoal por um dia.',122),
('guia_local','Guia local (por dia)','servico',50,0,'Habitante da região como guia para rotas, locais e costumes locais.',122),
('transporte_carrocinha','Transporte por carroça (por km)','servico',2,0,'Transporte de pessoas ou mercadorias em carroça; preço por quilômetro.',122),
('traducao','Tradução (por página)','servico',20,0,'Tradução escrita de documento ou interpretação oral entre línguas.',122),
('aluguel_bote','Aluguel de bote (por dia)','servico',30,0,'Bote pequeno com remador para cruzar rios, lagos e canais.',122),
('seleiro','Seleiro (por peça)','servico',100,0,'Fabricação ou reparo de arreios, selas, correias e acessórios de montaria.',122)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ─── EQUIPAMENTO DE AVENTURA adicional (+3) ───────────────────────────────────
insert into public.items (slug, name, category, price_pc, spaces, description, is_stackable, is_starter_eligible, page_ref)
values
('anzol_linha','Anzol e linha','equipamento_aventura',5,0.5,'Kit de pesca básico com anzol e linha resistente para obter alimento.',false,true,112),
('ampulheta','Ampulheta','equipamento_aventura',25,1,'Mede 1 hora com precisão; útil para vigilâncias e rituais temporizados.',false,false,112),
('gaiola','Gaiola para ave','equipamento_aventura',30,2,'Gaiola de metal para transportar pássaros ou pequenos animais.',false,false,112)
on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;

-- ── Flags de equipamento (pós-seed) ──────────────────────────────────────────
update public.items set can_be_held = true, is_two_handed = (weapon_grip = 'duas_maos')
  where category = 'arma';
update public.items set can_be_held = true  where category = 'escudo';
update public.items set can_be_worn = true  where category in ('armadura','vestuario','esoterico');
update public.items set can_be_held = true
  where category in ('alquimico_preparado','alquimico_catalisador','alquimico_veneno','alquimia_mistica');
update public.items set can_be_held = true  where category = 'ferramenta';

update public.items set is_cosmetic = true, can_be_worn = false, can_be_held = false
  where slug in ('traje_viajante','traje_corte','luva_pelica','bolsa_lona','mochila');

update public.items set is_purchasable = false
  where slug in ('bordao','tacape','funda');

update public.items set can_be_worn = true
  where slug in (
    'botas_velozes','capa_sombra','luvas_forca','elmo_percepcao',
    'cinto_forca','talisman_coragem','manto_invisibilidade',
    'anel_protecao','anel_resistencia','amuleto_saude'
  );
update public.items set can_be_held = true
  where slug in ('bolsa_guardadora','pedra_chamado','vela_revelacao','cristal_memoria','espelho_visoes');
