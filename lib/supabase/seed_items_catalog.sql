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
