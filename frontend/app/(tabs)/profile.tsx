import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProfileType } from '../../src/components/ProfileSelector';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import Input from '../../src/components/Input';
import Select from '../../src/components/Select';
import MultiSelect from '../../src/components/MultiSelect';
import Header from '../../src/components/Header';
import * as ImagePicker from 'expo-image-picker';


interface Vaccine {
  id: string;
  type: string;
  date: string;
  seasonality: string;
}

interface WeightControl {
  id: string;
  date: string;
  gain: string;
}

interface WeightExit {
  date: string;
  finalWeight: string;
}

interface HerdAnimal {
  id: string;
  tag: string;
  weight: string;
  weightDate: string;
  weightControls: WeightControl[];
  weightExit: WeightExit | null;
  vaccines: Vaccine[];
  supplementation: string;
}

const producerTypes = [
  { label: 'Agricultor', value: 'agricultor' },
  { label: 'Pecuarista', value: 'pecuarista' },
  { label: 'Ambos', value: 'ambos' },
];

const supplierTypes = [
  { label: 'Comércio', value: 'comercio' },
  { label: 'Indústria', value: 'industria' },
];

const activityOptions = [
  { label: 'Cria', value: 'cria' },
  { label: 'Recria', value: 'recria' },
  { label: 'Engorda', value: 'engorda' },
  { label: 'Gado de corte', value: 'gado_corte' },
  { label: 'Vaca leiteira', value: 'vaca_leiteira' },
];

const categoryOptions = [
  { label: 'Bovinos (bois)', value: 'bovinos' },
  { label: 'Suínos (porcos)', value: 'suinos' },
  { label: 'Ovinos (ovelhas)', value: 'ovinos' },
  { label: 'Caprinos (cabras)', value: 'caprinos' },
  { label: 'Equinos (cavalos)', value: 'equinos' },
  { label: 'Bufalinos (búfalos)', value: 'bufalinos' },
  { label: 'Aves', value: 'aves' },
];

const herdTypeOptions = [
  { label: 'Bezerro', value: 'bezerro' },
  { label: 'Garrote', value: 'garrote' },
  { label: 'Novilha', value: 'novilha' },
  { label: 'Boi Magro', value: 'boi_magro' },
  { label: 'Vaca', value: 'vaca' },
  { label: 'Touro', value: 'touro' },
];

const preferenceOptions = [
  { label: 'Macho', value: 'macho' },
  { label: 'Fêmea', value: 'femea' },
];

const commonDiseasesOptions = [
  { label: 'Brucelose', value: 'brucelose' },
  { label: 'Tuberculose Bovina', value: 'tuberculose_bovina' },
  { label: 'Leptospirose', value: 'leptospirose' },
  { label: 'Febre Aftosa', value: 'febre_aftosa' },
  { label: 'Carrapatos', value: 'carrapatos' },
  { label: 'Verminoses Gastrointestinais', value: 'verminoses' },
  { label: 'Berne', value: 'berne' },
];

const livestockSuppliesOptions = [
  { label: 'Rações proteicas', value: 'racoes_proteicas' },
  { label: 'Rações energéticas', value: 'racoes_energeticas' },
  { label: 'Rações balanceadas', value: 'racoes_balanceadas' },
  { label: 'Silagem (milho, sorgo, capim)', value: 'silagem' },
  { label: 'Feno e pré-secado', value: 'feno' },
  { label: 'Farelo de soja', value: 'farelo_soja' },
  { label: 'Farelo de algodão', value: 'farelo_algodao' },
  { label: 'Farelo de trigo', value: 'farelo_trigo' },
  { label: 'Milho', value: 'milho' },
  { label: 'Sorgo', value: 'sorgo' },
  { label: 'Sal mineral', value: 'sal_mineral' },
  { label: 'Núcleos minerais', value: 'nucleos_minerais' },
  { label: 'Suplementos protéicos e energéticos', value: 'suplementos' },
  { label: 'Vacina', value: 'vacina' },
  { label: 'Vermífugo', value: 'vermifugo' },
];

const agricultureTypeOptions = [
  { label: 'Tradicional', value: 'tradicional' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Orgânica', value: 'organica' },
  { label: 'Sustentável', value: 'sustentavel' },
  { label: 'Familiar', value: 'familiar' },
  { label: 'Precisão', value: 'precisao' },
  { label: 'Hidropônica', value: 'hidroponica' },
  { label: 'Agroecológica', value: 'agroecologica' },
  { label: 'Irrigada', value: 'irrigada' },
];

const cropOptions = [
  { label: 'Soja', value: 'soja' },
  { label: 'Sorgo', value: 'sorgo' },
  { label: 'Milho', value: 'milho' },
  { label: 'Milheto', value: 'milheto' },
  { label: 'Arroz', value: 'arroz' },
  { label: 'Trigo', value: 'trigo' },
  { label: 'Algodão', value: 'algodao' },
  { label: 'Feijão', value: 'feijao' },
  { label: 'Girassol', value: 'girassol' },
  { label: 'Gergelim', value: 'gergelim' },
  { label: 'Capim', value: 'capim' },
  { label: 'Abacaxi', value: 'abacaxi' },
  { label: 'Estilosantes Campo Grande', value: 'estilosantes_campo_grande' },
];

const seedTypeOptions = [
  { label: 'Fiscalizada', value: 'fiscalizada' },
  { label: 'Não Fiscalizada', value: 'nao_fiscalizada' },
];

const fertilizerTypeOptions = [
  { label: 'Foliar', value: 'foliar' },
  { label: 'Fósforo', value: 'fosforo' },
  { label: 'Fosfatado', value: 'fosfatado' },
  { label: 'Nitrogenado', value: 'nitrogenado' },
  { label: 'Potássio', value: 'potassio' },
  { label: 'Composto', value: 'composto' },
  { label: 'Orgânico', value: 'organico' },
];

const organicFertilizerOptions = [
  { label: 'Cama de Frango', value: 'cama_frango' },
  { label: 'Esterco de Galinha', value: 'esterco_galinha' },
  { label: 'Compost Barn', value: 'compost_barn' },
];

const defensiveTypeOptions = [
  { label: 'Herbicida', value: 'herbicida' },
  { label: 'Inseticida', value: 'inseticida' },
  { label: 'Fungicida', value: 'fungicida' },
];

const limestoneTypeOptions = [
  { label: 'Dolomítico', value: 'dolomitico' },
  { label: 'Calcítico', value: 'calcitico' },
  { label: 'Magnesiano', value: 'magnesiano' },
  { label: 'Gesso', value: 'gesso' },
];

const commerceSegmentOptions = [
  { label: 'Supermercado', value: 'supermercado' },
  { label: 'Produtos Agropecuários e Insumos Agrícolas', value: 'produtos_agropecuarios' },
  { label: 'Postos de Combustível', value: 'postos_combustivel' },
  { label: 'Uniforme', value: 'uniforme' },
  { label: 'EPIs', value: 'epis' },
  { label: 'Implementos Agrícolas', value: 'implementos_agricolas' },
  { label: 'Concessionárias', value: 'concessionarias' },
  { label: 'Distribuidora de Peças', value: 'distribuidora_pecas' },
  { label: 'Equipamentos', value: 'equipamentos' },
  { label: 'Tecnologia', value: 'tecnologia' },
  { label: 'Drones e Aviação', value: 'drones_aviacao' },
  { label: 'Drogarias', value: 'drogarias' },
];

const industrySegmentOptions = [
  { label: 'Ração', value: 'racao' },
  { label: 'Frigorífico', value: 'frigorifico' },
  { label: 'Agroenergia', value: 'agroenergia' },
  { label: 'Processamento de Grãos', value: 'processamento_graos' },
];

const segmentProductOptions: Record<string, { label: string; value: string }[]> = {
  supermercado: [
    { label: 'Alimentos e Bebidas', value: 'alimentos_bebidas' },
    { label: 'Produtos de Limpeza', value: 'produtos_limpeza' },
    { label: 'Higiene Pessoal', value: 'higiene_pessoal' },
    { label: 'Hortifrúti', value: 'hortifruiti' },
    { label: 'Açougue', value: 'acougue' },
  ],
  produtos_agropecuarios: [
    { label: 'Sementes', value: 'sementes' },
    { label: 'Adubos e Fertilizantes', value: 'adubos' },
    { label: 'Defensivos Agrícolas', value: 'defensivos' },
    { label: 'Rações', value: 'racoes' },
    { label: 'Ferramentas', value: 'ferramentas' },
  ],
  postos_combustivel: [
    { label: 'Gasolina', value: 'gasolina' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Etanol', value: 'etanol' },
    { label: 'GNV', value: 'gnv' },
    { label: 'Lubrificantes', value: 'lubrificantes' },
  ],
  uniforme: [
    { label: 'Uniformes Profissionais', value: 'uniformes_profissionais' },
    { label: 'Botas e Calçados', value: 'botas_calcados' },
    { label: 'Jalecos', value: 'jalecos' },
    { label: 'Aventais', value: 'aventais' },
  ],
  epis: [
    { label: 'Luvas de Proteção', value: 'luvas' },
    { label: 'Capacetes', value: 'capacetes' },
    { label: 'Óculos de Proteção', value: 'oculos' },
    { label: 'Máscaras', value: 'mascaras' },
    { label: 'Protetores Auriculares', value: 'protetores_auriculares' },
  ],
  implementos_agricolas: [
    { label: 'Arados', value: 'arados' },
    { label: 'Grades', value: 'grades' },
    { label: 'Plantadeiras', value: 'plantadeiras' },
    { label: 'Pulverizadores', value: 'pulverizadores' },
    { label: 'Colhedoras', value: 'colhedoras' },
  ],
  concessionarias: [
    { label: 'Tratores', value: 'tratores' },
    { label: 'Colheitadeiras', value: 'colheitadeiras' },
    { label: 'Plantadeiras', value: 'plantadeiras' },
    { label: 'Pulverizadores', value: 'pulverizadores' },
    { label: 'Caminhões', value: 'caminhoes' },
  ],
  distribuidora_pecas: [
    { label: 'Peças de Reposição', value: 'pecas_reposicao' },
    { label: 'Filtros', value: 'filtros' },
    { label: 'Correias', value: 'correias' },
    { label: 'Rolamentos', value: 'rolamentos' },
    { label: 'Componentes Hidráulicos', value: 'componentes_hidraulicos' },
  ],
  equipamentos: [
    { label: 'Sistemas de Irrigação', value: 'irrigacao' },
    { label: 'Silos e Armazéns', value: 'silos_armazens' },
    { label: 'Secadores', value: 'secadores' },
    { label: 'Balanças', value: 'balancas' },
    { label: 'Geradores', value: 'geradores' },
  ],
  tecnologia: [
    { label: 'Softwares de Gestão', value: 'softwares' },
    { label: 'Sensores e Monitoramento', value: 'sensores' },
    { label: 'GPS e Telemetria', value: 'gps' },
    { label: 'Automação', value: 'automacao' },
    { label: 'Drones', value: 'drones' },
  ],
  drones_aviacao: [
    { label: 'Drones Agrícolas', value: 'drones_agricolas' },
    { label: 'Aviões Agrícolas', value: 'avioes_agricolas' },
    { label: 'Peças e Acessórios', value: 'pecas_acessorios' },
    { label: 'Serviços de Pulverização', value: 'servicos_pulverizacao' },
  ],
  drogarias: [
    { label: 'Medicamentos Veterinários', value: 'medicamentos' },
    { label: 'Vacinas', value: 'vacinas' },
    { label: 'Vermífugos', value: 'vermifugos' },
    { label: 'Suplementos', value: 'suplementos' },
    { label: 'Material Cirúrgico', value: 'material_cirurgico' },
  ],
  racao: [
    { label: 'Ração para Bovinos', value: 'racao_bovinos' },
    { label: 'Ração para Suínos', value: 'racao_suinos' },
    { label: 'Ração para Aves', value: 'racao_aves' },
    { label: 'Ração para Equinos', value: 'racao_equinos' },
    { label: 'Premix e Núcleos', value: 'premix_nucleos' },
  ],
  frigorifico: [
    { label: 'Abate de Bovinos', value: 'abate_bovinos' },
    { label: 'Abate de Suínos', value: 'abate_suinos' },
    { label: 'Abate de Aves', value: 'abate_aves' },
    { label: 'Processamento de Carnes', value: 'processamento_carnes' },
    { label: 'Embutidos', value: 'embutidos' },
  ],
  agroenergia: [
    { label: 'Biodiesel', value: 'biodiesel' },
    { label: 'Etanol', value: 'etanol' },
    { label: 'Biomassa', value: 'biomassa' },
    { label: 'Biogás', value: 'biogas' },
  ],
  processamento_graos: [
    { label: 'Beneficiamento de Soja', value: 'beneficiamento_soja' },
    { label: 'Beneficiamento de Milho', value: 'beneficiamento_milho' },
    { label: 'Moagem', value: 'moagem' },
    { label: 'Armazenagem', value: 'armazenagem' },
    { label: 'Extração de Óleo', value: 'extracao_oleo' },
  ],
};

const serviceSegmentServiceOptions: Record<string, { label: string; value: string }[]> = {
  manutencao_maquinas: [
    { label: 'Tratores', value: 'tratores' },
    { label: 'Colheitadeiras', value: 'colheitadeiras' },
    { label: 'Plantadeiras', value: 'plantadeiras' },
    { label: 'Pulverizadores', value: 'pulverizadores' },
    { label: 'Pá Carregadeira', value: 'pa_carregadeira' },
    { label: 'Retroescavadeira', value: 'retroescavadeira' },
  ],
  manutencao_equipamentos: [
    { label: 'Sistemas de Irrigação', value: 'irrigacao' },
    { label: 'Calcareadeira', value: 'calcareadeira' },
    { label: 'Semeadoras', value: 'semeadoras' },
    { label: 'Secadores de Grãos', value: 'secadores' },
    { label: 'Silos', value: 'silos' },
    { label: 'Ordenhadeiras', value: 'ordenhadeiras' },
  ],
  consultoria_tecnica: [
    { label: 'Manejo de Solo', value: 'manejo_solo' },
    { label: 'Nutrição Animal', value: 'nutricao_animal' },
    { label: 'Controle de Pragas e Doenças', value: 'controle_pragas' },
    { label: 'Reprodução Animal', value: 'reproducao_animal' },
    { label: 'Irrigação e Drenagem', value: 'irrigacao_drenagem' },
    { label: 'Planejamento de Safra', value: 'planejamento_safra' },
  ],
  consultoria_tecnologia: [
    { label: 'Agricultura de Precisão', value: 'agricultura_precisao' },
    { label: 'Automação Rural', value: 'automacao_rural' },
    { label: 'Software de Gestão', value: 'software_gestao' },
    { label: 'Telemetria e Monitoramento', value: 'telemetria' },
    { label: 'Drones e Sensoriamento', value: 'drones_sensoriamento' },
  ],
  logistica_armazenagem: [
    { label: 'Transporte de Grãos', value: 'transporte_graos' },
    { label: 'Transporte de Insumos', value: 'transporte_insumos' },
    { label: 'Armazenagem de Grãos', value: 'armazenagem_graos' },
    { label: 'Gestão de Estoque', value: 'gestao_estoque' },
    { label: 'Secagem e Beneficiamento', value: 'secagem_beneficiamento' },
  ],
  financeiros_seguros: [
    { label: 'Seguro Rural', value: 'seguro_rural' },
    { label: 'Crédito Agrícola', value: 'credito_agricola' },
    { label: 'Gestão de Risco', value: 'gestao_risco' },
    { label: 'Planejamento Financeiro', value: 'planejamento_financeiro' },
    { label: 'Seguro de Máquinas', value: 'seguro_maquinas' },
  ],
  intermediacao: [
    { label: 'Compra e Venda de Gado', value: 'compra_venda_gado' },
    { label: 'Compra e Venda de Grãos', value: 'compra_venda_graos' },
    { label: 'Comercialização de Terras', value: 'comercializacao_terras' },
    { label: 'Leilões Rurais', value: 'leiloes_rurais' },
    { label: 'Negociação de Insumos', value: 'negociacao_insumos' },
  ],
  pesquisa_desenvolvimento: [
    { label: 'Melhoramento Genético Animal', value: 'melhoramento_genetico_animal' },
    { label: 'Desenvolvimento de Cultivares', value: 'desenvolvimento_cultivares' },
    { label: 'Pesquisa em Nutrição', value: 'pesquisa_nutricao' },
    { label: 'Análise de Solo e Foliar', value: 'analise_solo_foliar' },
    { label: 'Testes de Eficiência', value: 'testes_eficiencia' },
  ],
  treinamento_capacitacao: [
    { label: 'Operação de Máquinas', value: 'operacao_maquinas' },
    { label: 'Boas Práticas Agrícolas', value: 'boas_praticas' },
    { label: 'Gestão Rural', value: 'gestao_rural' },
    { label: 'Segurança do Trabalho', value: 'seguranca_trabalho' },
    { label: 'Manejo de Pastagens', value: 'manejo_pastagens' },
    { label: 'Inseminação Artificial', value: 'inseminacao_artificial' },
  ],
  servicos_ambientais: [
    { label: 'Recuperação de Áreas Degradadas', value: 'recuperacao_areas' },
    { label: 'Licenciamento Ambiental', value: 'licenciamento_ambiental' },
    { label: 'Gestão de Recursos Hídricos', value: 'gestao_recursos_hidricos' },
    { label: 'Reflorestamento', value: 'reflorestamento' },
    { label: 'Cadastro Ambiental Rural (CAR)', value: 'car' },
  ],
  despachante_veicular: [
    { label: 'Licenciamento de Veículos', value: 'licenciamento_veiculos' },
    { label: 'Transferência de Propriedade', value: 'transferencia_propriedade' },
    { label: 'Emplacamento', value: 'emplacamento' },
    { label: 'Segunda Via de Documentos', value: 'segunda_via_documentos' },
    { label: 'Baixa de Veículos', value: 'baixa_veiculos' },
  ],
  autoescola: [
    { label: 'CNH Categoria A (Moto)', value: 'cnh_a' },
    { label: 'CNH Categoria B (Carro)', value: 'cnh_b' },
    { label: 'CNH Categoria C (Caminhão)', value: 'cnh_c' },
    { label: 'CNH Categoria D (Ônibus)', value: 'cnh_d' },
    { label: 'CNH Categoria E (Carreta)', value: 'cnh_e' },
    { label: 'Reciclagem e Renovação', value: 'reciclagem' },
  ],
  frete_bovino: [
    { label: 'Transporte de Gado de Corte', value: 'gado_corte' },
    { label: 'Transporte de Gado Leiteiro', value: 'gado_leiteiro' },
    { label: 'Transporte de Reprodutores', value: 'reprodutores' },
    { label: 'Transporte Intermunicipal', value: 'intermunicipal' },
    { label: 'Transporte Interestadual', value: 'interestadual' },
  ],
};

const serviceSegmentOptions = [
  { label: 'Manutenção de Máquinas', value: 'manutencao_maquinas' },
  { label: 'Manutenção de Equipamentos', value: 'manutencao_equipamentos' },
  { label: 'Consultoria Técnica para Pecuária e Agricultura', value: 'consultoria_tecnica' },
  { label: 'Consultoria em Tecnologia', value: 'consultoria_tecnologia' },
  { label: 'Logística e Armazenagem', value: 'logistica_armazenagem' },
  { label: 'Financeiros, Seguros e Gestão de Risco', value: 'financeiros_seguros' },
  { label: 'Intermediação', value: 'intermediacao' },
  { label: 'Pesquisa e Desenvolvimento', value: 'pesquisa_desenvolvimento' },
  { label: 'Treinamento e Capacitação', value: 'treinamento_capacitacao' },
  { label: 'Serviços Ambientais', value: 'servicos_ambientais' },
  { label: 'Despachante Veicular', value: 'despachante_veicular' },
  { label: 'Autoescola', value: 'autoescola' },
  { label: 'Frete Bovino', value: 'frete_bovino' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, logout, profileImage, updateProfileImage, currentRoleLabel } = useAuth();

  const [fullName, setFullName] = useState('João da Silva');
  const [nickname, setNickname] = useState('João');
  const [birthDate, setBirthDate] = useState('15/05/1985');
  const [cpf, setCpf] = useState('123.456.789-00');
  const [identity, setIdentity] = useState('12.345.678-9');
  const [maritalStatus, setMaritalStatus] = useState('Solteiro');
  const [nationality, setNationality] = useState('São Paulo, SP');
  const [email, setEmail] = useState(user?.email || 'joao.silva@email.com');
  const [phone, setPhone] = useState('+55 11 9 8765-4321');

  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [companyName, setCompanyName] = useState('Fazenda Silva Ltda');
  const [tradeName, setTradeName] = useState('Fazenda Silva');
  const [stateRegistration, setStateRegistration] = useState('123.456.789.012');
  const [startDate, setStartDate] = useState('01/01/2020');
  const [businessActivity, setBusinessActivity] = useState('Agropecuária');
  const [cnaes, setCnaes] = useState('0111-3/01, 0121-1/01');
  const [address, setAddress] = useState('Rua Principal, 123');
  const [cep, setCep] = useState('12345-678');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [neighborhood, setNeighborhood] = useState('Centro');
  const [profileTypes, setProfileTypes] = useState<ProfileType[]>(['producer']);

  const [producerType, setProducerType] = useState<string>('pecuarista');
  const [supplierType, setSupplierType] = useState<string>('');

  const [activities, setActivities] = useState<string[]>(['cria', 'recria']);
  const [activitiesCustom, setActivitiesCustom] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['bovinos']);
  const [categoriesCustom, setCategoriesCustom] = useState<string[]>([]);
  const [herdTypes, setHerdTypes] = useState<string[]>(['bezerro', 'garrote']);
  const [herdTypesCustom, setHerdTypesCustom] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>(['macho']);
  const [preferencesCustom, setPreferencesCustom] = useState<string[]>([]);
  const [commonDiseases, setCommonDiseases] = useState<string[]>(['brucelose']);
  const [commonDiseasesCustom, setCommonDiseasesCustom] = useState<string[]>([]);
  const [livestockSupplies, setLivestockSupplies] = useState<string[]>(['racoes_proteicas']);
  const [livestockSuppliesCustom, setLivestockSuppliesCustom] = useState<string[]>([]);
  const [animalQuantity, setAnimalQuantity] = useState<string>('150');
  const [vaccinationDate, setVaccinationDate] = useState<string>('15/06/2025');
  const [herdControl, setHerdControl] = useState<HerdAnimal[]>([]);

  const [agricultureTypes, setAgricultureTypes] = useState<string[]>([]);
  const [agricultureTypesCustom, setAgricultureTypesCustom] = useState<string[]>([]);
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [cropTypesCustom, setCropTypesCustom] = useState<string[]>([]);
  const [seedTypes, setSeedTypes] = useState<string[]>([]);
  const [seedTypesCustom, setSeedTypesCustom] = useState<string[]>([]);
  const [fertilizerTypes, setFertilizerTypes] = useState<string[]>([]);
  const [fertilizerTypesCustom, setFertilizerTypesCustom] = useState<string[]>([]);
  const [organicFertilizerTypes, setOrganicFertilizerTypes] = useState<string[]>([]);
  const [organicFertilizerTypesCustom, setOrganicFertilizerTypesCustom] = useState<string[]>([]);
  const [defensiveTypes, setDefensiveTypes] = useState<string[]>([]);
  const [defensiveTypesCustom, setDefensiveTypesCustom] = useState<string[]>([]);
  const [limestoneTypes, setLimestoneTypes] = useState<string[]>([]);
  const [limestoneTypesCustom, setLimestoneTypesCustom] = useState<string[]>([]);

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [segmentsCustom, setSegmentsCustom] = useState<string[]>([]);
  const [segmentData, setSegmentData] = useState<Record<string, { products: string[]; productsCustom: string[] }>>({});

  const [selectedServiceSegments, setSelectedServiceSegments] = useState<string[]>([]);
  const [serviceSegmentsCustom, setServiceSegmentsCustom] = useState<string[]>([]);
  const [serviceSegmentData, setServiceSegmentData] = useState<Record<string, { services: string[]; servicesCustom: string[] }>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [activeAnimalTabs, setActiveAnimalTabs] = useState<Record<string, 'weight' | 'vaccine'>>({});

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSave = () => {
    Alert.alert(
      'Sucesso',
      'Suas informações foram atualizadas com sucesso!',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  function toggleMultiSelect(
    currentValues: string[],
    setValue: (values: string[]) => void,
    value: string
  ) {
    if (currentValues.includes(value)) {
      setValue(currentValues.filter((v) => v !== value));
    } else {
      setValue([...currentValues, value]);
    }
  }

  function addCustomValue(
    setCustomValues: (values: string[]) => void,
    currentValues: string[],
    value: string
  ) {
    if (!currentValues.includes(value)) {
      setCustomValues([...currentValues, value]);
    }
  }

  function removeCustomValue(
    setCustomValues: (values: string[]) => void,
    currentValues: string[],
    value: string
  ) {
    setCustomValues(currentValues.filter((v) => v !== value));
  }

  function toggleSegmentProduct(segment: string, product: string) {
    setSegmentData((prev) => {
      const currentProducts = prev[segment]?.products || [];
      const newProducts = currentProducts.includes(product)
        ? currentProducts.filter((p) => p !== product)
        : [...currentProducts, product];

      return {
        ...prev,
        [segment]: {
          ...prev[segment],
          products: newProducts,
          productsCustom: prev[segment]?.productsCustom || [],
        },
      };
    });
  }

  function addSegmentCustom(segment: string, value: string) {
    setSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        productsCustom: [...(prev[segment]?.productsCustom || []), value],
      },
    }));
  }

  function removeSegmentCustom(segment: string, value: string) {
    setSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        productsCustom: (prev[segment]?.productsCustom || []).filter((v) => v !== value),
      },
    }));
  }

  function toggleServiceSegmentService(segment: string, service: string) {
    setServiceSegmentData((prev) => {
      const currentServices = prev[segment]?.services || [];
      const newServices = currentServices.includes(service)
        ? currentServices.filter((s) => s !== service)
        : [...currentServices, service];

      return {
        ...prev,
        [segment]: {
          ...prev[segment],
          services: newServices,
          servicesCustom: prev[segment]?.servicesCustom || [],
        },
      };
    });
  }

  function addServiceSegmentCustom(segment: string, value: string) {
    setServiceSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        servicesCustom: [...(prev[segment]?.servicesCustom || []), value],
      },
    }));
  }

  function removeServiceSegmentCustom(segment: string, value: string) {
    setServiceSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        servicesCustom: (prev[segment]?.servicesCustom || []).filter((v) => v !== value),
      },
    }));
  }

  function getSegmentLabel(segment: string): string {
    const allSegments = [...commerceSegmentOptions, ...industrySegmentOptions];
    const found = allSegments.find((s) => s.value === segment);
    return found ? found.label : segment;
  }

  function getServiceSegmentLabel(segment: string): string {
    const found = serviceSegmentOptions.find((s) => s.value === segment);
    return found ? found.label : segment;
  }

  const addAnimal = () => {
    const newAnimal: HerdAnimal = {
      id: Date.now().toString(),
      tag: '',
      weight: '',
      weightDate: '',
      weightControls: [],
      weightExit: null,
      vaccines: [],
      supplementation: '',
    };
    setHerdControl((prev) => [...prev, newAnimal]);
    setActiveAnimalTabs((prev) => ({ ...prev, [newAnimal.id]: 'weight' }));
  };

  const removeAnimal = (id: string) => {
    setHerdControl((prev) => prev.filter((animal) => animal.id !== id));
    setActiveAnimalTabs((prev) => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  };

  const updateAnimal = (id: string, field: keyof HerdAnimal, value: string) => {
    setHerdControl((prev) =>
      prev.map((animal) => (animal.id === id ? { ...animal, [field]: value } : animal))
    );
  };

  const addVaccine = (animalId: string) => {
    const newVaccine: Vaccine = {
      id: Date.now().toString(),
      type: '',
      date: '',
      seasonality: '',
    };
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, vaccines: [...animal.vaccines, newVaccine] }
          : animal
      )
    );
  };

  const removeVaccine = (animalId: string, vaccineId: string) => {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, vaccines: animal.vaccines.filter((v) => v.id !== vaccineId) }
          : animal
      )
    );
  };

  const updateVaccine = (animalId: string, vaccineId: string, field: keyof Vaccine, value: string) => {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? {
            ...animal,
            vaccines: animal.vaccines.map((vaccine) =>
              vaccine.id === vaccineId ? { ...vaccine, [field]: value } : vaccine
            ),
          }
          : animal
      )
    );
  };

  const addWeightControl = (animalId: string) => {
    const newControl: WeightControl = {
      id: Date.now().toString(),
      date: '',
      gain: '',
    };
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, weightControls: [...animal.weightControls, newControl] }
          : animal
      )
    );
  };

  const removeWeightControl = (animalId: string, controlId: string) => {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, weightControls: animal.weightControls.filter((c) => c.id !== controlId) }
          : animal
      )
    );
  };

  const updateWeightControl = (animalId: string, controlId: string, field: keyof WeightControl, value: string) => {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? {
            ...animal,
            weightControls: animal.weightControls.map((control) =>
              control.id === controlId ? { ...control, [field]: value } : control
            ),
          }
          : animal
      )
    );
  };

  const updateWeightExit = (animalId: string, field: keyof WeightExit, value: string) => {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? {
            ...animal,
            weightExit: animal.weightExit
              ? { ...animal.weightExit, [field]: value }
              : { date: '', finalWeight: '', [field]: value },
          }
          : animal
      )
    );
  };

  const calculateTotalGain = (animal: HerdAnimal): string => {
    const initialWeight = parseFloat(animal.weight) || 0;
    const finalWeight = parseFloat(animal.weightExit?.finalWeight || '0') || 0;

    if (finalWeight > 0 && initialWeight > 0) {
      return (finalWeight - initialWeight).toFixed(2);
    }

    return '0.00';
  };

  const setAnimalTab = (animalId: string, tab: 'weight' | 'vaccine') => {
    setActiveAnimalTabs((prev) => ({ ...prev, [animalId]: tab }));
  };

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await updateProfileImage(result.assets[0].uri);
    }
  }

  const currentSegmentOptions = supplierType === 'comercio' ? commerceSegmentOptions : industrySegmentOptions;

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header
        userName={user?.nickname}
        userRole={currentRoleLabel}
        profileImage={profileImage}
        showBackButton={true}
        screenTitle="Perfil"
        onBackPress={() => router.back()}
        onProfilePress={() => { }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {!isEditing && (
              <>
                <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={24}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <View style={styles.profileImageContainer}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <Ionicons name="person-circle" size={120} color={colors.primary} />
                    )}
                    <TouchableOpacity
                      style={[styles.editImageButton, { backgroundColor: colors.primary }]}
                      onPress={pickImage}
                    >
                      <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {fullName}
                  </Text>
                  <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                    {currentRoleLabel}
                  </Text>
                </View>

                <View style={[styles.infoContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Dados Pessoais
                  </Text>

                  <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nome completo</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{fullName}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="happy-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Apelido</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{nickname}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Data de nascimento</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{birthDate}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CPF</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{cpf}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Identidade</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{identity}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Estado Civil</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{maritalStatus}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Naturalidade</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{nationality}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{email}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Telefone</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{phone}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.infoContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Dados da Empresa
                  </Text>

                  {profileTypes.includes('producer') && profileTypes.includes('supplier') ? (
                    <>
                      {cnpj && (
                        <View style={styles.infoItem}>
                          <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CNPJ</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{cnpj}</Text>
                          </View>
                        </View>
                      )}

                      {companyName && (
                        <View style={styles.infoItem}>
                          <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Razão Social</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{companyName}</Text>
                          </View>
                        </View>
                      )}

                      {tradeName && (
                        <View style={styles.infoItem}>
                          <Ionicons name="storefront-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nome Fantasia</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{tradeName}</Text>
                          </View>
                        </View>
                      )}

                      {stateRegistration && (
                        <View style={styles.infoItem}>
                          <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Inscrição Estadual</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{stateRegistration}</Text>
                          </View>
                        </View>
                      )}

                      {cnaes && (
                        <View style={styles.infoItem}>
                          <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CNAEs</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{cnaes}</Text>
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      {(companyName || tradeName) && (
                        <View style={styles.infoItem}>
                          <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
                          <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nome da Propriedade</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{companyName || tradeName}</Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  {startDate && (
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Início das Atividades</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{startDate}</Text>
                      </View>
                    </View>
                  )}

                  {businessActivity && (
                    <View style={styles.infoItem}>
                      <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Ramo de Atividade</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{businessActivity}</Text>
                      </View>
                    </View>
                  )}

                  {cep && (
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CEP</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{cep}</Text>
                      </View>
                    </View>
                  )}

                  {address && (
                    <View style={styles.infoItem}>
                      <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Endereço</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{address}</Text>
                      </View>
                    </View>
                  )}

                  {neighborhood && (
                    <View style={styles.infoItem}>
                      <Ionicons name="map-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Bairro</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{neighborhood}</Text>
                      </View>
                    </View>
                  )}

                  {city && (
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Cidade</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{city}{state ? ` - ${state}` : ''}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {profileTypes.includes('producer') && producerType === 'pecuarista' && (
                  <View style={[styles.infoContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Dados de Pecuária
                    </Text>

                    <View style={styles.infoItem}>
                      <Ionicons name="leaf-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Quantidade de Animais</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{animalQuantity}</Text>
                      </View>
                    </View>

                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Data de Vacinação</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{vaccinationDate}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {isEditing && (
              <View style={[styles.editContainer, { backgroundColor: colors.cardBackground }]}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Dados Pessoais
                </Text>

                <Input
                  label="Nome completo"
                  required
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Digite o nome"
                  autoCapitalize="words"
                />

                <Input
                  label="Apelido"
                  required
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Como deseja ser chamado"
                  autoCapitalize="words"
                />

                <Input
                  label="Data de nascimento"
                  required
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="xx/xx/xxxx"
                  mask="date"
                  maxLength={10}
                />

                <Input
                  label="CPF"
                  required
                  value={cpf}
                  onChangeText={setCpf}
                  placeholder="xxx.xxx.xxx-xx"
                  mask="cpf"
                  maxLength={14}
                />

                <Input
                  label="Identidade"
                  required
                  value={identity}
                  onChangeText={setIdentity}
                  placeholder="xx.xxx.xxx-x"
                />

                <Input
                  label="Estado Civil"
                  required
                  value={maritalStatus}
                  onChangeText={setMaritalStatus}
                  placeholder="Ex: Solteiro, Casado, etc."
                  autoCapitalize="words"
                />

                <Input
                  label="Naturalidade"
                  required
                  value={nationality}
                  onChangeText={setNationality}
                  placeholder="Ex: São Paulo, SP"
                  autoCapitalize="words"
                />

                <Input
                  label="Email"
                  required
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite o email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Telefone"
                  required
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+xx xx x xxxx-xxxx"
                  mask="phone"
                  maxLength={19}
                />

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                  Dados da Empresa
                </Text>

                {profileTypes.includes('producer') && profileTypes.includes('supplier') ? (
                  <>
                    <Input
                      label="CNPJ"
                      required
                      value={cnpj}
                      onChangeText={setCnpj}
                      placeholder="xx.xxx.xxx/xxxx-xx"
                      mask="cnpj"
                      maxLength={18}
                    />

                    <Input
                      label="Razão social"
                      required
                      value={companyName}
                      onChangeText={setCompanyName}
                      placeholder="Digite sua razão social"
                      autoCapitalize="words"
                    />

                    <Input
                      label="Nome Fantasia"
                      required
                      value={tradeName}
                      onChangeText={setTradeName}
                      placeholder="Digite seu nome fantasia"
                      autoCapitalize="words"
                    />

                    <Input
                      label="Inscrição estadual"
                      value={stateRegistration}
                      onChangeText={setStateRegistration}
                      placeholder="xxx.xxx.xxx.xxx (opcional)"
                      mask="ie"
                      maxLength={15}
                    />

                    <Input
                      label="CNAEs"
                      value={cnaes}
                      onChangeText={setCnaes}
                      placeholder="Ex: 0111-3/01, 0121-1/01"
                    />
                  </>
                ) : (
                  <Input
                    label="Nome da Propriedade"
                    required
                    value={companyName || tradeName}
                    onChangeText={(text) => {
                      setCompanyName(text);
                      setTradeName(text);
                    }}
                    placeholder="Digite o nome da sua propriedade"
                    autoCapitalize="words"
                  />
                )}

                <Input
                  label="Início das Atividades"
                  required
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="xx/xx/xxxx"
                  mask="date"
                  maxLength={10}
                />

                <Input
                  label="Ramo de Atividade"
                  required
                  value={businessActivity}
                  onChangeText={setBusinessActivity}
                  placeholder="Ex: Agropecuária, Comércio, etc."
                  autoCapitalize="words"
                />

                <Input
                  label="CEP"
                  required
                  value={cep}
                  onChangeText={setCep}
                  placeholder="00000-000"
                  mask="cep"
                  maxLength={9}
                />

                <Input
                  label="Endereço"
                  required
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Rua, Avenida, etc."
                  autoCapitalize="words"
                />

                <Input
                  label="Bairro"
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                  placeholder="Nome do bairro"
                  autoCapitalize="words"
                />

                <Input
                  label="Cidade"
                  required
                  value={city}
                  onChangeText={setCity}
                  placeholder="Nome da cidade"
                  autoCapitalize="words"
                />

                <Input
                  label="Estado (UF)"
                  required
                  value={state}
                  onChangeText={(text) => setState(text.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  autoCapitalize="characters"
                />

                {profileTypes.includes('producer') && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                      Perfil Profissional - Produtor
                    </Text>

                    <Select
                      label="Tipo de produtor"
                      required
                      value={producerType}
                      onValueChange={setProducerType}
                      options={producerTypes}
                      placeholder="Selecione o tipo de produtor"
                    />

                    {(producerType === 'pecuarista' || producerType === 'ambos') && (
                      <>
                        <MultiSelect
                          label="Atividade"
                          required
                          options={activityOptions}
                          selectedValues={activities}
                          onToggle={(value) => toggleMultiSelect(activities, setActivities, value)}
                          allowCustom
                          customValues={activitiesCustom}
                          onAddCustom={(value) => addCustomValue(setActivitiesCustom, activitiesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setActivitiesCustom, activitiesCustom, value)}
                        />

                        <MultiSelect
                          label="Categoria"
                          required
                          options={categoryOptions}
                          selectedValues={categories}
                          onToggle={(value) => toggleMultiSelect(categories, setCategories, value)}
                          allowCustom
                          customValues={categoriesCustom}
                          onAddCustom={(value) => addCustomValue(setCategoriesCustom, categoriesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setCategoriesCustom, categoriesCustom, value)}
                        />

                        <MultiSelect
                          label="Tipo de rebanho"
                          required
                          options={herdTypeOptions}
                          selectedValues={herdTypes}
                          onToggle={(value) => toggleMultiSelect(herdTypes, setHerdTypes, value)}
                          allowCustom
                          customValues={herdTypesCustom}
                          onAddCustom={(value) => addCustomValue(setHerdTypesCustom, herdTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setHerdTypesCustom, herdTypesCustom, value)}
                        />

                        <MultiSelect
                          label="Preferências"
                          required
                          options={preferenceOptions}
                          selectedValues={preferences}
                          onToggle={(value) => toggleMultiSelect(preferences, setPreferences, value)}
                          allowCustom
                          customValues={preferencesCustom}
                          onAddCustom={(value) => addCustomValue(setPreferencesCustom, preferencesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setPreferencesCustom, preferencesCustom, value)}
                        />

                        <MultiSelect
                          label="Doenças comuns no rebanho"
                          required
                          options={commonDiseasesOptions}
                          selectedValues={commonDiseases}
                          onToggle={(value) => toggleMultiSelect(commonDiseases, setCommonDiseases, value)}
                          allowCustom
                          customValues={commonDiseasesCustom}
                          onAddCustom={(value) => addCustomValue(setCommonDiseasesCustom, commonDiseasesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setCommonDiseasesCustom, commonDiseasesCustom, value)}
                        />

                        <MultiSelect
                          label="Insumos utilizados"
                          required
                          options={livestockSuppliesOptions}
                          selectedValues={livestockSupplies}
                          onToggle={(value) =>
                            toggleMultiSelect(livestockSupplies, setLivestockSupplies, value)
                          }
                          allowCustom
                          customValues={livestockSuppliesCustom}
                          onAddCustom={(value) => addCustomValue(setLivestockSuppliesCustom, livestockSuppliesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setLivestockSuppliesCustom, livestockSuppliesCustom, value)}
                        />

                        <Input
                          label="Quantidade de animais na fazenda"
                          required
                          value={animalQuantity}
                          onChangeText={setAnimalQuantity}
                          placeholder="xxx"
                          keyboardType="numeric"
                        />

                        <Input
                          label="Data estipulada para vacinação"
                          required
                          value={vaccinationDate}
                          onChangeText={setVaccinationDate}
                          placeholder="xx/xx/xxxx"
                          mask="date"
                          maxLength={10}
                        />

                        <View style={styles.herdControlContainer}>
                          <View style={styles.herdControlHeader}>
                            <Text style={[styles.herdControlTitle, { color: colors.text }]}>
                              Controle de Rebanho
                            </Text>
                            <TouchableOpacity
                              style={[styles.addButton, { backgroundColor: colors.primary }]}
                              onPress={addAnimal}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="add" size={20} color={colors.white} />
                              <Text style={[styles.addButtonText, { color: colors.white }]}>Adicionar animal</Text>
                            </TouchableOpacity>
                          </View>

                          {herdControl.map((animal, index) => (
                            <View
                              key={animal.id}
                              style={[styles.animalCard, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}
                            >
                              <View style={styles.animalCardHeader}>
                                <Text style={[styles.animalCardTitle, { color: colors.text }]}>
                                  Animal {index + 1}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => removeAnimal(animal.id)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                              </View>

                              <Input
                                label="Código (Brinco)"
                                required
                                value={animal.tag}
                                onChangeText={(value) => updateAnimal(animal.id, 'tag', value)}
                                placeholder="Digite o código do brinco"
                              />

                              <Input
                                label="Suplementação (kg)"
                                required
                                value={animal.supplementation}
                                onChangeText={(value) =>
                                  updateAnimal(animal.id, 'supplementation', value)
                                }
                                placeholder="Digite o peso da suplementação"
                                keyboardType="numeric"
                              />

                              <View style={[styles.tabContainer, { backgroundColor: colors.cardAlt }]}>
                                <TouchableOpacity
                                  style={[
                                    styles.tab,
                                    (activeAnimalTabs[animal.id] || 'weight') === 'weight' && [styles.tabActive, { backgroundColor: colors.white, shadowColor: colors.shadowColor }],
                                    { borderColor: colors.primary },
                                  ]}
                                  onPress={() => setAnimalTab(animal.id, 'weight')}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons
                                    name="fitness"
                                    size={18}
                                    color={(activeAnimalTabs[animal.id] || 'weight') === 'weight' ? colors.primary : colors.textSecondary}
                                  />
                                  <Text
                                    style={[
                                      styles.tabText,
                                      (activeAnimalTabs[animal.id] || 'weight') === 'weight' && styles.tabTextActive,
                                      {
                                        color: (activeAnimalTabs[animal.id] || 'weight') === 'weight'
                                          ? colors.primary
                                          : colors.textSecondary,
                                      },
                                    ]}
                                  >
                                    Controle de Peso
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.tab,
                                    (activeAnimalTabs[animal.id] || 'weight') === 'vaccine' && [styles.tabActive, { backgroundColor: colors.white, shadowColor: colors.shadowColor }],
                                    { borderColor: colors.primary },
                                  ]}
                                  onPress={() => setAnimalTab(animal.id, 'vaccine')}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons
                                    name="medical"
                                    size={18}
                                    color={(activeAnimalTabs[animal.id] || 'weight') === 'vaccine' ? colors.primary : colors.textSecondary}
                                  />
                                  <Text
                                    style={[
                                      styles.tabText,
                                      (activeAnimalTabs[animal.id] || 'weight') === 'vaccine' && styles.tabTextActive,
                                      {
                                        color: (activeAnimalTabs[animal.id] || 'weight') === 'vaccine'
                                          ? colors.primary
                                          : colors.textSecondary,
                                      },
                                    ]}
                                  >
                                    Vacinas
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              {(activeAnimalTabs[animal.id] || 'weight') === 'weight' && (
                                <View style={styles.weightControlMainSection}>
                                  <View style={styles.weightEntrySection}>
                                    <Text style={[styles.weightSubsectionTitle, { color: colors.text }]}>
                                      Entrada
                                    </Text>

                                    <Input
                                      label="Peso inicial (kg)"
                                      required
                                      value={animal.weight}
                                      onChangeText={(value) => updateAnimal(animal.id, 'weight', value)}
                                      placeholder="Digite o peso inicial"
                                      keyboardType="numeric"
                                    />

                                    <Input
                                      label="Data"
                                      required
                                      value={animal.weightDate}
                                      onChangeText={(value) => updateAnimal(animal.id, 'weightDate', value)}
                                      placeholder="xx/xx/xxxx"
                                      mask="date"
                                      maxLength={10}
                                    />
                                  </View>

                                  <View style={styles.weightControlsSubsection}>
                                    <View style={styles.weightControlHeader}>
                                      <Text style={[styles.weightSubsectionTitle, { color: colors.text }]}>
                                        Controles
                                      </Text>
                                      <TouchableOpacity
                                        style={[styles.addWeightControlButton, { backgroundColor: colors.primary }]}
                                        onPress={() => addWeightControl(animal.id)}
                                        activeOpacity={0.7}
                                      >
                                        <Ionicons name="add" size={16} color={colors.white} />
                                        <Text style={[styles.addWeightControlButtonText, { color: colors.white }]}>Adicionar</Text>
                                      </TouchableOpacity>
                                    </View>

                                    {animal.weightControls.map((control, cIndex) => (
                                      <View
                                        key={control.id}
                                        style={[styles.weightControlCard, { borderColor: colors.cardBorder }]}
                                      >
                                        <View style={styles.weightControlCardHeader}>
                                          <Text style={[styles.weightControlCardTitle, { color: colors.text }]}>
                                            Controle {cIndex + 1}
                                          </Text>
                                          <TouchableOpacity
                                            onPress={() => removeWeightControl(animal.id, control.id)}
                                            activeOpacity={0.7}
                                          >
                                            <Ionicons name="close-circle" size={20} color={colors.error} />
                                          </TouchableOpacity>
                                        </View>

                                        <Input
                                          label="Data"
                                          required
                                          value={control.date}
                                          onChangeText={(value) =>
                                            updateWeightControl(animal.id, control.id, 'date', value)
                                          }
                                          placeholder="xx/xx/xxxx"
                                          mask="date"
                                          maxLength={10}
                                        />

                                        <Input
                                          label="Ganho de peso (kg)"
                                          required
                                          value={control.gain}
                                          onChangeText={(value) =>
                                            updateWeightControl(animal.id, control.id, 'gain', value)
                                          }
                                          placeholder="Digite o ganho"
                                          keyboardType="numeric"
                                        />
                                      </View>
                                    ))}

                                    {animal.weightControls.length === 0 && (
                                      <Text style={[styles.emptyWeightControlText, { color: colors.textSecondary }]}>
                                        Nenhum controle cadastrado. Clique em "Adicionar" para incluir.
                                      </Text>
                                    )}
                                  </View>

                                  <View style={styles.weightExitSection}>
                                    <Text style={[styles.weightSubsectionTitle, { color: colors.text }]}>
                                      Saída
                                    </Text>

                                    <Input
                                      label="Data de saída"
                                      value={animal.weightExit?.date || ''}
                                      onChangeText={(value) => updateWeightExit(animal.id, 'date', value)}
                                      placeholder="xx/xx/xxxx"
                                      mask="date"
                                      maxLength={10}
                                    />

                                    <Input
                                      label="Peso final (kg)"
                                      value={animal.weightExit?.finalWeight || ''}
                                      onChangeText={(value) => updateWeightExit(animal.id, 'finalWeight', value)}
                                      placeholder="Digite o peso final"
                                      keyboardType="numeric"
                                    />

                                    {animal.weightExit?.finalWeight && animal.weight && (
                                      <View style={[styles.totalGainContainer, { backgroundColor: colors.successLight, borderLeftColor: colors.success }]}>
                                        <Text style={[styles.totalGainLabel, { color: colors.primary }]}>
                                          Ganho total:
                                        </Text>
                                        <Text style={[styles.totalGainValue, { color: colors.primary }]}>
                                          {calculateTotalGain(animal)} kg
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              )}

                              {(activeAnimalTabs[animal.id] || 'weight') === 'vaccine' && (
                                <View style={styles.vaccineSection}>
                                  <View style={styles.vaccineSectionHeaderSingle}>
                                    <TouchableOpacity
                                      style={[styles.addVaccineButton, { backgroundColor: colors.primary }]}
                                      onPress={() => addVaccine(animal.id)}
                                      activeOpacity={0.7}
                                    >
                                      <Ionicons name="add" size={16} color={colors.white} />
                                      <Text style={[styles.addVaccineButtonText, { color: colors.white }]}>Adicionar Vacina</Text>
                                    </TouchableOpacity>
                                  </View>

                                  {animal.vaccines.map((vaccine, vIndex) => (
                                    <View
                                      key={vaccine.id}
                                      style={[styles.vaccineCard, { borderColor: colors.cardBorder }]}
                                    >
                                      <View style={styles.vaccineCardHeader}>
                                        <Text style={[styles.vaccineCardTitle, { color: colors.text }]}>
                                          Vacina {vIndex + 1}
                                        </Text>
                                        <TouchableOpacity
                                          onPress={() => removeVaccine(animal.id, vaccine.id)}
                                          activeOpacity={0.7}
                                        >
                                          <Ionicons name="close-circle" size={20} color={colors.error} />
                                        </TouchableOpacity>
                                      </View>

                                      <Input
                                        label="Tipo da vacina"
                                        required
                                        value={vaccine.type}
                                        onChangeText={(value) =>
                                          updateVaccine(animal.id, vaccine.id, 'type', value)
                                        }
                                        placeholder="Digite o tipo da vacina"
                                      />

                                      <Input
                                        label="Data da vacina"
                                        required
                                        value={vaccine.date}
                                        onChangeText={(value) =>
                                          updateVaccine(animal.id, vaccine.id, 'date', value)
                                        }
                                        placeholder="xx/xx/xxxx"
                                        mask="date"
                                        maxLength={10}
                                      />

                                      <Input
                                        label="Sazonalidade (prazo)"
                                        required
                                        value={vaccine.seasonality}
                                        onChangeText={(value) =>
                                          updateVaccine(animal.id, vaccine.id, 'seasonality', value)
                                        }
                                        placeholder="Ex: Anual, 6 meses, etc."
                                      />
                                    </View>
                                  ))}

                                  {animal.vaccines.length === 0 && (
                                    <Text style={[styles.emptyVaccineText, { color: colors.textSecondary }]}>
                                      Nenhuma vacina cadastrada. Clique em "Adicionar" para incluir.
                                    </Text>
                                  )}
                                </View>
                              )}
                            </View>
                          ))}

                          {herdControl.length === 0 && (
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                              Nenhum animal cadastrado. Clique em "Adicionar animal" para começar.
                            </Text>
                          )}
                        </View>
                      </>
                    )}

                    {(producerType === 'agricultor' || producerType === 'ambos') && (
                      <>
                        {producerType === 'ambos' && (
                          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
                            Dados de Agricultor
                          </Text>
                        )}
                        <MultiSelect
                          label="Tipo de Agricultura"
                          required
                          options={agricultureTypeOptions}
                          selectedValues={agricultureTypes}
                          onToggle={(value) => toggleMultiSelect(agricultureTypes, setAgricultureTypes, value)}
                          allowCustom
                          customValues={agricultureTypesCustom}
                          onAddCustom={(value) => addCustomValue(setAgricultureTypesCustom, agricultureTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setAgricultureTypesCustom, agricultureTypesCustom, value)}
                        />

                        <MultiSelect
                          label="Tipo de cultura"
                          required
                          options={cropOptions}
                          selectedValues={cropTypes}
                          onToggle={(value) => toggleMultiSelect(cropTypes, setCropTypes, value)}
                          allowCustom
                          customValues={cropTypesCustom}
                          onAddCustom={(value) => addCustomValue(setCropTypesCustom, cropTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setCropTypesCustom, cropTypesCustom, value)}
                        />

                        <MultiSelect
                          label="Tipo de semente"
                          required
                          options={seedTypeOptions}
                          selectedValues={seedTypes}
                          onToggle={(value) => toggleMultiSelect(seedTypes, setSeedTypes, value)}
                          allowCustom
                          customValues={seedTypesCustom}
                          onAddCustom={(value) => addCustomValue(setSeedTypesCustom, seedTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setSeedTypesCustom, seedTypesCustom, value)}
                        />

                        <MultiSelect
                          label="Tipo de adubo"
                          required
                          options={fertilizerTypeOptions}
                          selectedValues={fertilizerTypes}
                          onToggle={(value) => toggleMultiSelect(fertilizerTypes, setFertilizerTypes, value)}
                          allowCustom
                          customValues={fertilizerTypesCustom}
                          onAddCustom={(value) => addCustomValue(setFertilizerTypesCustom, fertilizerTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setFertilizerTypesCustom, fertilizerTypesCustom, value)}
                        />

                        {fertilizerTypes.includes('organico') && (
                          <MultiSelect
                            label="Adubo Orgânico"
                            required
                            options={organicFertilizerOptions}
                            selectedValues={organicFertilizerTypes}
                            onToggle={(value) => toggleMultiSelect(organicFertilizerTypes, setOrganicFertilizerTypes, value)}
                            allowCustom
                            customValues={organicFertilizerTypesCustom}
                            onAddCustom={(value) => addCustomValue(setOrganicFertilizerTypesCustom, organicFertilizerTypesCustom, value)}
                            onRemoveCustom={(value) => removeCustomValue(setOrganicFertilizerTypesCustom, organicFertilizerTypesCustom, value)}
                          />
                        )}

                        <MultiSelect
                          label="Tipo de Defensivo"
                          required
                          options={defensiveTypeOptions}
                          selectedValues={defensiveTypes}
                          onToggle={(value) => toggleMultiSelect(defensiveTypes, setDefensiveTypes, value)}
                          allowCustom
                          customValues={defensiveTypesCustom}
                          onAddCustom={(value) => addCustomValue(setDefensiveTypesCustom, defensiveTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setDefensiveTypesCustom, defensiveTypesCustom, value)}
                        />

                        <MultiSelect
                          label="Tipo de Calcário"
                          required
                          options={limestoneTypeOptions}
                          selectedValues={limestoneTypes}
                          onToggle={(value) => toggleMultiSelect(limestoneTypes, setLimestoneTypes, value)}
                          allowCustom
                          customValues={limestoneTypesCustom}
                          onAddCustom={(value) => addCustomValue(setLimestoneTypesCustom, limestoneTypesCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setLimestoneTypesCustom, limestoneTypesCustom, value)}
                        />
                      </>
                    )}
                  </>
                )}

                {profileTypes.includes('supplier') && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                      Perfil Profissional - Fornecedor
                    </Text>

                    <Select
                      label="Tipo de Fornecedor"
                      required
                      value={supplierType}
                      onValueChange={setSupplierType}
                      options={supplierTypes}
                      placeholder="Selecione o tipo"
                    />

                    {supplierType && (
                      <>
                        <MultiSelect
                          label="Segmentos"
                          required
                          options={currentSegmentOptions}
                          selectedValues={selectedSegments}
                          onToggle={(value) => {
                            if (selectedSegments.includes(value)) {
                              setSelectedSegments(selectedSegments.filter((s) => s !== value));
                              setSegmentData((prevData) => {
                                const { [value]: removed, ...rest } = prevData;
                                return rest;
                              });
                            } else {
                              setSelectedSegments([...selectedSegments, value]);
                              setSegmentData((prevData) => ({
                                ...prevData,
                                [value]: {
                                  products: [],
                                  productsCustom: [],
                                },
                              }));
                            }
                          }}
                          allowCustom
                          customValues={segmentsCustom}
                          onAddCustom={(value) => addCustomValue(setSegmentsCustom, segmentsCustom, value)}
                          onRemoveCustom={(value) => removeCustomValue(setSegmentsCustom, segmentsCustom, value)}
                          itemsPerRow={supplierType === 'comercio' ? 2 : 3}
                        />

                        {selectedSegments.map((segment) => (
                          <View key={segment} style={styles.segmentDataContainer}>
                            <Text style={[styles.segmentDataTitle, { color: colors.text }]}>
                              {getSegmentLabel(segment)}
                            </Text>

                            <MultiSelect
                              label="Produtos/Serviços"
                              required
                              options={segmentProductOptions[segment] || []}
                              selectedValues={segmentData[segment]?.products || []}
                              onToggle={(value) => toggleSegmentProduct(segment, value)}
                              allowCustom
                              customValues={segmentData[segment]?.productsCustom || []}
                              onAddCustom={(value) => addSegmentCustom(segment, value)}
                              onRemoveCustom={(value) => removeSegmentCustom(segment, value)}
                            />
                          </View>
                        ))}
                      </>
                    )}
                  </>
                )}

                {profileTypes.includes('service_provider') && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                      Perfil Profissional - Prestador de Serviço
                    </Text>

                    <MultiSelect
                      label="Segmentos de Serviço"
                      required
                      options={serviceSegmentOptions}
                      selectedValues={selectedServiceSegments}
                      onToggle={(value) => {
                        if (selectedServiceSegments.includes(value)) {
                          setSelectedServiceSegments(selectedServiceSegments.filter((s) => s !== value));
                          setServiceSegmentData((prevData) => {
                            const { [value]: removed, ...rest } = prevData;
                            return rest;
                          });
                        } else {
                          setSelectedServiceSegments([...selectedServiceSegments, value]);
                          setServiceSegmentData((prevData) => ({
                            ...prevData,
                            [value]: {
                              services: [],
                              servicesCustom: [],
                            },
                          }));
                        }
                      }}
                      allowCustom
                      customValues={serviceSegmentsCustom}
                      onAddCustom={(value) => addCustomValue(setServiceSegmentsCustom, serviceSegmentsCustom, value)}
                      onRemoveCustom={(value) => removeCustomValue(setServiceSegmentsCustom, serviceSegmentsCustom, value)}
                      itemsPerRow={2}
                    />

                    {selectedServiceSegments.map((segment) => (
                      <View key={segment} style={styles.segmentDataContainer}>
                        <Text style={[styles.segmentDataTitle, { color: colors.text }]}>
                          {getServiceSegmentLabel(segment)}
                        </Text>

                        <MultiSelect
                          label="Serviços"
                          required
                          options={serviceSegmentServiceOptions[segment] || []}
                          selectedValues={serviceSegmentData[segment]?.services || []}
                          onToggle={(value) => toggleServiceSegmentService(segment, value)}
                          allowCustom
                          customValues={serviceSegmentData[segment]?.servicesCustom || []}
                          onAddCustom={(value) => addServiceSegmentCustom(segment, value)}
                          onRemoveCustom={(value) => removeServiceSegmentCustom(segment, value)}
                        />
                      </View>
                    ))}
                  </>
                )}

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.white} />
                  <Text style={[styles.saveButtonText, { color: colors.white }]}>Salvar Alterações</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.error }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.white} />
              <Text style={[styles.logoutButtonText, { color: colors.white }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 20,
  },
  card: {
    position: 'relative',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  userRole: {
    fontSize: 16,
    marginTop: 4,
  },
  infoContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editContainer: {
    position: 'relative',
    borderRadius: 16,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  herdControlContainer: {
    marginTop: 5,
  },
  herdControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  herdControlTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  animalCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  animalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  animalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    padding: 4,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    backgroundColor: 'transparent',
  },
  tabActive: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  vaccineSection: {
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  vaccineSectionHeaderSingle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  addVaccineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    gap: 4,
  },
  addVaccineButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vaccineCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  vaccineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccineCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyVaccineText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  weightControlMainSection: {
    marginTop: 0,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  weightSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  weightEntrySection: {
    backgroundColor: 'transparent',
  },
  weightControlsSubsection: {
    backgroundColor: 'transparent',
  },
  weightControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addWeightControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  addWeightControlButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  weightControlCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  weightControlCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weightControlCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyWeightControlText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  weightExitSection: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  totalGainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  totalGainLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalGainValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentDataContainer: {
    marginTop: 5,
  },
  segmentDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
});
