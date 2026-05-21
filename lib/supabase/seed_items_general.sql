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
