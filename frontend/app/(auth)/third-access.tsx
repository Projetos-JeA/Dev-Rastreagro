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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProfileType } from '../../src/components/ProfileSelector';
import StepIndicator from '../../src/components/StepIndicator';
import Select from '../../src/components/Select';
import MultiSelect from '../../src/components/MultiSelect';
import Input from '../../src/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

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

export default function ThirdAccessScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { registerSeller, registerServiceProvider, registerBuyer } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProfiles: ProfileType[] = params.profileTypes
    ? JSON.parse(params.profileTypes as string)
    : [];

  const [producerType, setProducerType] = useState<string>('');
  const [supplierType, setSupplierType] = useState<string>('');
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [segmentsCustom, setSegmentsCustom] = useState<string>('');

  const [segmentData, setSegmentData] = useState<Record<string, { products: string[]; productsCustom: string }>>({});

  const [activities, setActivities] = useState<string[]>([]);
  const [activitiesCustom, setActivitiesCustom] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesCustom, setCategoriesCustom] = useState<string>('');
  const [herdTypes, setHerdTypes] = useState<string[]>([]);
  const [herdTypesCustom, setHerdTypesCustom] = useState<string>('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [preferencesCustom, setPreferencesCustom] = useState<string>('');
  const [commonDiseases, setCommonDiseases] = useState<string[]>([]);
  const [commonDiseasesCustom, setCommonDiseasesCustom] = useState<string>('');
  const [livestockSupplies, setLivestockSupplies] = useState<string[]>([]);
  const [livestockSuppliesCustom, setLivestockSuppliesCustom] = useState<string>('');
  const [animalQuantity, setAnimalQuantity] = useState<string>('');
  const [vaccinationDate, setVaccinationDate] = useState<string>('');

  const [herdControl, setHerdControl] = useState<HerdAnimal[]>([]);
  const [activeAnimalTabs, setActiveAnimalTabs] = useState<Record<string, 'weight' | 'vaccine'>>({});

  const [agricultureTypes, setAgricultureTypes] = useState<string[]>([]);
  const [agricultureTypesCustom, setAgricultureTypesCustom] = useState<string>('');
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [cropTypesCustom, setCropTypesCustom] = useState<string>('');
  const [seedTypes, setSeedTypes] = useState<string[]>([]);
  const [seedTypesCustom, setSeedTypesCustom] = useState<string>('');
  const [fertilizerTypes, setFertilizerTypes] = useState<string[]>([]);
  const [fertilizerTypesCustom, setFertilizerTypesCustom] = useState<string>('');
  const [organicFertilizerTypes, setOrganicFertilizerTypes] = useState<string[]>([]);
  const [organicFertilizerTypesCustom, setOrganicFertilizerTypesCustom] = useState<string>('');
  const [defensiveTypes, setDefensiveTypes] = useState<string[]>([]);
  const [defensiveTypesCustom, setDefensiveTypesCustom] = useState<string>('');
  const [limestoneTypes, setLimestoneTypes] = useState<string[]>([]);
  const [limestoneTypesCustom, setLimestoneTypesCustom] = useState<string>('');

  const [selectedServiceSegments, setSelectedServiceSegments] = useState<string[]>([]);
  const [serviceSegmentsCustom, setServiceSegmentsCustom] = useState<string>('');
  const [serviceSegmentData, setServiceSegmentData] = useState<Record<string, { services: string[]; servicesCustom: string }>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleContinue() {
    const newErrors: Record<string, string> = {};

    if (selectedProfiles.includes('producer') && !producerType) {
      newErrors.producerType = 'Selecione o tipo de produtor';
    }

    if (selectedProfiles.includes('producer') && (producerType === 'pecuarista' || producerType === 'ambos')) {
      if (activities.length === 0) {
        newErrors.activities = 'Selecione pelo menos uma atividade';
      }
      if (categories.length === 0) {
        newErrors.categories = 'Selecione pelo menos uma categoria';
      }
      if (herdTypes.length === 0) {
        newErrors.herdTypes = 'Selecione pelo menos um tipo de rebanho';
      }
      if (preferences.length === 0) {
        newErrors.preferences = 'Selecione pelo menos uma preferência';
      }
      if (commonDiseases.length === 0) {
        newErrors.commonDiseases = 'Selecione pelo menos uma doença comum';
      }
      if (livestockSupplies.length === 0) {
        newErrors.livestockSupplies = 'Selecione pelo menos um insumo utilizado';
      }
      if (!animalQuantity || animalQuantity.trim() === '') {
        newErrors.animalQuantity = 'Quantidade de animais é obrigatória';
      }
      if (!vaccinationDate || vaccinationDate.trim() === '') {
        newErrors.vaccinationDate = 'Data de vacinação é obrigatória';
      } else if (vaccinationDate.length !== 10) {
        newErrors.vaccinationDate = 'Data inválida';
      }

      herdControl.forEach((animal, index) => {
        if (!animal.tag || animal.tag.trim() === '') {
          newErrors[`animal_${animal.id}_tag`] = `Animal ${index + 1}: Código (Brinco) é obrigatório`;
        }
        if (!animal.supplementation || animal.supplementation.trim() === '') {
          newErrors[`animal_${animal.id}_supplementation`] = `Animal ${index + 1}: Suplementação é obrigatória`;
        }
        if (!animal.weight || animal.weight.trim() === '') {
          newErrors[`animal_${animal.id}_weight`] = `Animal ${index + 1}: Peso inicial é obrigatório`;
        }
        if (!animal.weightDate || animal.weightDate.trim() === '') {
          newErrors[`animal_${animal.id}_weightDate`] = `Animal ${index + 1}: Data do peso inicial é obrigatória`;
        }

        animal.weightControls.forEach((control, cIndex) => {
          if (!control.date || control.date.trim() === '') {
            newErrors[`animal_${animal.id}_control_${control.id}_date`] = `Animal ${index + 1}, Controle ${cIndex + 1}: Data é obrigatória`;
          }
          if (!control.gain || control.gain.trim() === '') {
            newErrors[`animal_${animal.id}_control_${control.id}_gain`] = `Animal ${index + 1}, Controle ${cIndex + 1}: Ganho de peso é obrigatório`;
          }
        });

        animal.vaccines.forEach((vaccine, vIndex) => {
          if (!vaccine.type || vaccine.type.trim() === '') {
            newErrors[`animal_${animal.id}_vaccine_${vaccine.id}_type`] = `Animal ${index + 1}, Vacina ${vIndex + 1}: Tipo da vacina é obrigatório`;
          }
          if (!vaccine.date || vaccine.date.trim() === '') {
            newErrors[`animal_${animal.id}_vaccine_${vaccine.id}_date`] = `Animal ${index + 1}, Vacina ${vIndex + 1}: Data da vacina é obrigatória`;
          }
          if (!vaccine.seasonality || vaccine.seasonality.trim() === '') {
            newErrors[`animal_${animal.id}_vaccine_${vaccine.id}_seasonality`] = `Animal ${index + 1}, Vacina ${vIndex + 1}: Sazonalidade é obrigatória`;
          }
        });
      });
    }

    if (selectedProfiles.includes('producer') && (producerType === 'agricultor' || producerType === 'ambos')) {
      if (agricultureTypes.length === 0) {
        newErrors.agricultureTypes = 'Selecione pelo menos um tipo de agricultura';
      }
      if (cropTypes.length === 0) {
        newErrors.cropTypes = 'Selecione pelo menos um tipo de cultura';
      }
      if (seedTypes.length === 0) {
        newErrors.seedTypes = 'Selecione pelo menos um tipo de semente';
      }
      if (fertilizerTypes.length === 0) {
        newErrors.fertilizerTypes = 'Selecione pelo menos um tipo de adubo';
      }
      if (fertilizerTypes.includes('organico') && organicFertilizerTypes.length === 0) {
        newErrors.organicFertilizerTypes = 'Selecione pelo menos um tipo de adubo orgânico';
      }
      if (defensiveTypes.length === 0) {
        newErrors.defensiveTypes = 'Selecione pelo menos um tipo de defensivo';
      }
      if (limestoneTypes.length === 0) {
        newErrors.limestoneTypes = 'Selecione pelo menos um tipo de calcário';
      }
    }

    if (selectedProfiles.includes('supplier')) {
      if (!supplierType) {
        newErrors.supplierType = 'Selecione o tipo de fornecedor';
      }
      if (selectedSegments.length === 0 && !segmentsCustom) {
        newErrors.segments = 'Selecione pelo menos um segmento';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const completeData: any = {
      ...params,
      profileTypes: selectedProfiles,
    };

    if (selectedProfiles.includes('producer')) {
      completeData.producerType = producerType;

      if (producerType === 'pecuarista' || producerType === 'ambos') {
        completeData.livestockData = {
          activities,
          activitiesCustom,
          categories,
          categoriesCustom,
          herdTypes,
          herdTypesCustom,
          preferences,
          preferencesCustom,
          commonDiseases,
          commonDiseasesCustom,
          supplies: livestockSupplies,
          suppliesCustom: livestockSuppliesCustom,
          animalQuantity,
          vaccinationDate,
          herdControl,
        };
      }

      if (producerType === 'agricultor' || producerType === 'ambos') {
        completeData.agricultureData = {
          agricultureTypes,
          agricultureTypesCustom,
          cropTypes,
          cropTypesCustom,
          seedTypes,
          seedTypesCustom,
          fertilizerTypes,
          fertilizerTypesCustom,
          organicFertilizerTypes,
          organicFertilizerTypesCustom,
          defensiveTypes,
          defensiveTypesCustom,
          limestoneTypes,
          limestoneTypesCustom,
        };
      }
    }

    if (selectedProfiles.includes('supplier')) {
      completeData.supplierData = {
        supplierType,
        segments: selectedSegments,
        segmentsCustom,
        segmentData,
      };
    }

    if (selectedProfiles.includes('service_provider')) {
      completeData.serviceProviderData = {
        segments: selectedServiceSegments,
        segmentsCustom: serviceSegmentsCustom,
        segmentData: serviceSegmentData,
      };
    }

    console.log('🔵 ===== DADOS COMPLETOS DO CADASTRO =====');
    console.log(JSON.stringify(completeData, null, 2));


    setIsSubmitting(true);
    try {
      console.log('🔵 Enviando dados para o backend...');


      if (completeData.profileTypes.includes('producer')) {
        console.log('📤 Cadastrando como PRODUTOR (Seller)...');


        if (!completeData.email || !completeData.password) {
          Alert.alert('Erro', 'Email e senha são obrigatórios');
          setIsSubmitting(false);
          return;
        }

        if (!completeData.companyName && !completeData.tradeName) {
          Alert.alert('Erro', 'Nome da propriedade é obrigatório');
          setIsSubmitting(false);
          return;
        }


        const isProducerAndSupplier = completeData.profileTypes?.includes('producer') && completeData.profileTypes?.includes('supplier');

        if (isProducerAndSupplier) {

          if (!completeData.cnpj) {
            Alert.alert('Erro', 'CNPJ é obrigatório');
            setIsSubmitting(false);
            return;
          }
        } else {

          if (!completeData.cpf) {
            Alert.alert('Erro', 'CPF é obrigatório');
            setIsSubmitting(false);
            return;
          }
        }


        const address = completeData.address || '';
        const city = completeData.city || '';
        const state = completeData.state || '';
        const cep = completeData.cep || '';

        if (!address || !city || !state || !cep) {
          Alert.alert('Erro', 'Campos de endereço são obrigatórios. Por favor, preencha todos os campos.');
          setIsSubmitting(false);
          return;
        }



        const activities: any[] = [];


        if (completeData.producerType === 'agricultor' || completeData.producerType === 'ambos') {


          if (completeData.agricultureData?.cropTypes?.length > 0) {
            activities.push({
              category_id: 1,
              group_id: null,
              item_id: null,
            });
          }
        }


        if (completeData.producerType === 'pecuarista' || completeData.producerType === 'ambos') {

          activities.push({
            category_id: 2,
            group_id: null,
            item_id: null,
          });
        }


        if (activities.length === 0) {
          activities.push({
            category_id: 1,
            group_id: null,
            item_id: null,
          });
        }


        const documentNumber = isProducerAndSupplier
          ? (completeData.cnpj || '')
          : (completeData.cpf || '');

        const sellerPayload = {
          email: completeData.email,
          password: completeData.password,
          company: {
            nome_propriedade: completeData.companyName || completeData.tradeName || params.fullName || 'Propriedade',
            cnpj_cpf: documentNumber,
            insc_est_identidade: isProducerAndSupplier ? (completeData.stateRegistration || null) : null,
            endereco: address,
            bairro: completeData.neighborhood || null,
            cep: cep,
            cidade: city,
            estado: state,
            email: completeData.email,
            activities: activities,
          },
        };

        console.log('📤 Payload do produtor (seller):', JSON.stringify(sellerPayload, null, 2));
        await registerSeller(sellerPayload);
        console.log('✅ Produtor cadastrado com sucesso!');


        Alert.alert(
          '✅ Cadastro realizado com sucesso!',
          'Sua propriedade foi cadastrada. Redirecionando para login...',
          [{ text: 'OK' }]
        );


        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } else if (completeData.profileTypes.includes('supplier')) {
        console.log('📤 Cadastrando como FORNECEDOR (Seller)...');


        const activities: any[] = [];


        const sellerPayload = {
          email: completeData.email,
          password: completeData.password,
          company: {
            nome_propriedade: completeData.companyName || completeData.tradeName || 'Empresa',
            cnpj_cpf: completeData.cnpj || '',
            insc_est_identidade: completeData.stateRegistration || null,
            endereco: completeData.address || '',
            bairro: completeData.neighborhood || null,
            cep: completeData.cep || '',
            cidade: completeData.city || '',
            estado: completeData.state || '',
            email: completeData.email,
            activities: activities,
          },
        };

        console.log('📤 Payload do vendedor:', JSON.stringify(sellerPayload, null, 2));
        await registerSeller(sellerPayload);
        console.log('✅ Vendedor cadastrado com sucesso!');


        Alert.alert(
          '✅ Cadastro realizado com sucesso!',
          'Sua empresa foi cadastrada. Redirecionando para login...',
          [{ text: 'OK' }]
        );


        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } else if (completeData.profileTypes.includes('service_provider')) {
        console.log('📤 Cadastrando como PRESTADOR DE SERVIÇO...');

        const servicePayload = {
          email: completeData.email,
          password: completeData.password,
          service_provider: {
            nome_servico: completeData.serviceName || 'Serviço',
            email_contato: completeData.email,
            cidade: completeData.city || '',
            estado: completeData.state || '',
            telefone: completeData.phone || null,
            endereco: completeData.address || null,
            bairro: completeData.neighborhood || null,
            cep: completeData.cep || null,
            cnpj_cpf: completeData.cnpj || null,
            insc_est_identidade: completeData.stateRegistration || null,
          },
        };

        console.log('📤 Payload do prestador:', JSON.stringify(servicePayload, null, 2));
        await registerServiceProvider(servicePayload);
        console.log('✅ Prestador cadastrado com sucesso!');


        Alert.alert(
          '✅ Cadastro realizado com sucesso!',
          'Seu perfil foi criado. Redirecionando para login...',
          [{ text: 'OK' }]
        );


        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } else {
        Alert.alert('Erro', 'Tipo de perfil não suportado para cadastro automático.');
      }
    } catch (error: any) {
      console.error('❌ ERRO NO CADASTRO:', error);
      console.error('Status:', error?.response?.status);
      console.error('Data:', error?.response?.data);
      console.error('Error completo:', JSON.stringify(error, null, 2));
      console.error('Error.message:', error?.message);
      console.error('Error.name:', error?.name);
      console.error('🔴 DETALHES DO ERRO DO BACKEND:', JSON.stringify(error?.response?.data, null, 2));


      let errorMessage = 'Não foi possível concluir o cadastro.';
      let errorTitle = '❌ Erro ao cadastrar';


      const status = error?.response?.status || error?.status;


      if (status === 422) {

        if (error?.response?.data?.detail) {

          if (Array.isArray(error.response.data.detail)) {
            const firstError = error.response.data.detail[0];
            if (firstError?.msg) {
              const field = firstError.loc?.slice(1).join('.') || 'campo';
              errorMessage = `${field}: ${firstError.msg}`;
              errorTitle = '❌ Erro de validação';
            } else {
              errorMessage = JSON.stringify(firstError);
            }
          }

          else if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
            errorTitle = '❌ Erro de validação';
          }

          else if (error.response.data.detail.errors) {
            const firstError = Object.values(error.response.data.detail.errors)[0];
            errorMessage = String(firstError);
            errorTitle = '❌ Erro de validação';
          }
        }

        else if (error?.response?.data?.errors) {
          const backendErrors = error.response.data.errors;
          if (Array.isArray(backendErrors)) {
            const firstError = backendErrors[0];
            if (firstError?.msg) {
              const field = firstError.loc?.slice(1).join('.') || 'campo';
              errorMessage = `${field}: ${firstError.msg}`;
            } else {
              errorMessage = String(firstError);
            }
          } else {
            const firstError = Object.values(backendErrors)[0];
            errorMessage = String(firstError);
          }
          errorTitle = '❌ Erro de validação';
        }
      } else if (status === 400) {

        errorTitle = '❌ Erro ao cadastrar';
        if (!errorMessage || errorMessage === 'Não foi possível concluir o cadastro.') {
          errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
        }
      } else if (status === 409) {

        errorTitle = '❌ Erro';
        if (!errorMessage || errorMessage === 'Não foi possível concluir o cadastro.') {
          errorMessage = 'Email ou documento já cadastrado';
        }
      }


      console.log('🔴 Exibindo erro na tela:', errorTitle, errorMessage);
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLoginRedirect() {
    router.push('/(auth)/login');
  }

  function handleProducerTypeChange(type: string) {
    setProducerType(type);
    setErrors((prev) => {
      const { producerType, ...rest } = prev;
      return rest;
    });

    setActivities([]);
    setActivitiesCustom('');
    setCategories([]);
    setCategoriesCustom('');
    setHerdTypes([]);
    setHerdTypesCustom('');
    setPreferences([]);
    setPreferencesCustom('');
    setCommonDiseases([]);
    setCommonDiseasesCustom('');
    setLivestockSupplies([]);
    setLivestockSuppliesCustom('');
    setAnimalQuantity('');
    setVaccinationDate('');
    setHerdControl([]);
    setAgricultureTypes([]);
    setAgricultureTypesCustom('');
    setCropTypes([]);
    setCropTypesCustom('');
    setSeedTypes([]);
    setSeedTypesCustom('');
    setFertilizerTypes([]);
    setFertilizerTypesCustom('');
    setOrganicFertilizerTypes([]);
    setOrganicFertilizerTypesCustom('');
    setDefensiveTypes([]);
    setDefensiveTypesCustom('');
    setLimestoneTypes([]);
    setLimestoneTypesCustom('');
  }

  function handleSupplierTypeChange(type: string) {
    setSupplierType(type);
    setSelectedSegments([]);
    setSegmentsCustom('');
    setSegmentData({});
    setErrors((prev) => {
      const { supplierType, segments, ...rest } = prev;
      return rest;
    });
  }

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

  function toggleSegment(segment: string) {
    setSelectedSegments((prev) => {
      if (prev.includes(segment)) {
        const newSegments = prev.filter((s) => s !== segment);
        setSegmentData((prevData) => {
          const { [segment]: removed, ...rest } = prevData;
          return rest;
        });
        return newSegments;
      } else {
        setSegmentData((prevData) => ({
          ...prevData,
          [segment]: {
            products: [],
            productsCustom: '',
          },
        }));
        return [...prev, segment];
      }
    });

    if (errors.segments) {
      setErrors((prev) => {
        const { segments, ...rest } = prev;
        return rest;
      });
    }
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
        },
      };
    });
  }

  function updateSegmentCustom(segment: string, value: string) {
    setSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        productsCustom: value,
      },
    }));
  }

  function toggleServiceSegment(segment: string) {
    setSelectedServiceSegments((prev) => {
      if (prev.includes(segment)) {
        const newSegments = prev.filter((s) => s !== segment);
        setServiceSegmentData((prevData) => {
          const { [segment]: removed, ...rest } = prevData;
          return rest;
        });
        return newSegments;
      } else {
        setServiceSegmentData((prevData) => ({
          ...prevData,
          [segment]: {
            services: [],
            servicesCustom: '',
          },
        }));
        return [...prev, segment];
      }
    });

    if (errors.serviceSegments) {
      setErrors((prev) => {
        const { serviceSegments, ...rest } = prev;
        return rest;
      });
    }
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
        },
      };
    });
  }

  function updateServiceSegmentCustom(segment: string, value: string) {
    setServiceSegmentData((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        servicesCustom: value,
      },
    }));
  }

  function addAnimal() {
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
  }

  function removeAnimal(id: string) {
    setHerdControl((prev) => prev.filter((animal) => animal.id !== id));
    setActiveAnimalTabs((prev) => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }

  function updateAnimal(id: string, field: keyof HerdAnimal, value: string) {
    setHerdControl((prev) =>
      prev.map((animal) => (animal.id === id ? { ...animal, [field]: value } : animal))
    );

    const errorKey = `animal_${id}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  }

  function addVaccine(animalId: string) {
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
  }

  function removeVaccine(animalId: string, vaccineId: string) {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, vaccines: animal.vaccines.filter((v) => v.id !== vaccineId) }
          : animal
      )
    );
  }

  function updateVaccine(animalId: string, vaccineId: string, field: keyof Vaccine, value: string) {
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

    const errorKey = `animal_${animalId}_vaccine_${vaccineId}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  }

  function addWeightControl(animalId: string) {
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
  }

  function removeWeightControl(animalId: string, controlId: string) {
    setHerdControl((prev) =>
      prev.map((animal) =>
        animal.id === animalId
          ? { ...animal, weightControls: animal.weightControls.filter((c) => c.id !== controlId) }
          : animal
      )
    );
  }

  function updateWeightControl(animalId: string, controlId: string, field: keyof WeightControl, value: string) {
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

    const errorKey = `animal_${animalId}_control_${controlId}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  }

  function updateWeightExit(animalId: string, field: keyof WeightExit, value: string) {
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
  }

  function calculateTotalGain(animal: HerdAnimal): string {
    const initialWeight = parseFloat(animal.weight) || 0;
    const finalWeight = parseFloat(animal.weightExit?.finalWeight || '0') || 0;

    if (finalWeight > 0 && initialWeight > 0) {
      return (finalWeight - initialWeight).toFixed(2);
    }

    return '0.00';
  }

  function setAnimalTab(animalId: string, tab: 'weight' | 'vaccine') {
    setActiveAnimalTabs((prev) => ({ ...prev, [animalId]: tab }));
  }

  function getProfileLabel(profile: ProfileType): string {
    switch (profile) {
      case 'producer':
        return 'Produtor';
      case 'supplier':
        return 'Fornecedor';
      case 'service_provider':
        return 'Prestador de Serviço';
      default:
        return '';
    }
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

  const currentSegmentOptions =
    supplierType === 'comercio' ? commerceSegmentOptions : industrySegmentOptions;

  const showHerdControl = producerType === 'pecuarista' || producerType === 'ambos';

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>

              <StepIndicator
                currentStep={3}
                totalSteps={3}
                onStepPress={(step) => {
                  if (step === 2) {
                    router.back();
                  }
                }}
              />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Perfil Profissional
              </Text>

              {selectedProfiles.includes('producer') && (
                <View>
                  {selectedProfiles.length > 1 && (
                    <Text style={[styles.profileSectionTitle, { color: colors.text }]}>
                      Dados de {getProfileLabel('producer')}
                    </Text>
                  )}

                  <Select
                    label="Tipo de produtor"
                    required
                    value={producerType}
                    onValueChange={handleProducerTypeChange}
                    options={producerTypes}
                    placeholder="Selecione o tipo de produtor"
                    error={errors.producerType}
                  />

                  {(producerType === 'pecuarista' || producerType === 'ambos') && (
                    <>
                      {producerType === 'ambos' && (
                        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
                          Dados de Pecuarista
                        </Text>
                      )}
                      <MultiSelect
                        label="Atividade"
                        required
                        options={activityOptions}
                        selectedValues={activities}
                        onToggle={(value) => toggleMultiSelect(activities, setActivities, value)}
                        error={errors.activities}
                        allowCustom
                        customValue={activitiesCustom}
                        onCustomChange={setActivitiesCustom}
                      />

                      <MultiSelect
                        label="Categoria"
                        required
                        options={categoryOptions}
                        selectedValues={categories}
                        onToggle={(value) => toggleMultiSelect(categories, setCategories, value)}
                        error={errors.categories}
                        allowCustom
                        customValue={categoriesCustom}
                        onCustomChange={setCategoriesCustom}
                      />

                      <MultiSelect
                        label="Tipo de rebanho"
                        required
                        options={herdTypeOptions}
                        selectedValues={herdTypes}
                        onToggle={(value) => toggleMultiSelect(herdTypes, setHerdTypes, value)}
                        error={errors.herdTypes}
                        allowCustom
                        customValue={herdTypesCustom}
                        onCustomChange={setHerdTypesCustom}
                      />

                      <MultiSelect
                        label="Preferências"
                        required
                        options={preferenceOptions}
                        selectedValues={preferences}
                        onToggle={(value) => toggleMultiSelect(preferences, setPreferences, value)}
                        error={errors.preferences}
                        allowCustom
                        customValue={preferencesCustom}
                        onCustomChange={setPreferencesCustom}
                      />

                      <MultiSelect
                        label="Doenças comuns no rebanho"
                        required
                        options={commonDiseasesOptions}
                        selectedValues={commonDiseases}
                        onToggle={(value) => toggleMultiSelect(commonDiseases, setCommonDiseases, value)}
                        error={errors.commonDiseases}
                        allowCustom
                        customValue={commonDiseasesCustom}
                        onCustomChange={setCommonDiseasesCustom}
                      />

                      <MultiSelect
                        label="Insumos utilizados"
                        required
                        options={livestockSuppliesOptions}
                        selectedValues={livestockSupplies}
                        onToggle={(value) =>
                          toggleMultiSelect(livestockSupplies, setLivestockSupplies, value)
                        }
                        error={errors.livestockSupplies}
                        allowCustom
                        customValue={livestockSuppliesCustom}
                        onCustomChange={setLivestockSuppliesCustom}
                      />

                      <Input
                        label="Quantidade de animais na fazenda"
                        required
                        value={animalQuantity}
                        onChangeText={(value) => {
                          setAnimalQuantity(value);
                          if (errors.animalQuantity) {
                            setErrors((prev) => {
                              const { animalQuantity, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                        placeholder="xxx"
                        keyboardType="numeric"
                        error={errors.animalQuantity}
                      />

                      <Input
                        label="Data estipulada para vacinação"
                        required
                        value={vaccinationDate}
                        onChangeText={(value) => {
                          setVaccinationDate(value);
                          if (errors.vaccinationDate) {
                            setErrors((prev) => {
                              const { vaccinationDate, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                        placeholder="xx/xx/xxxx"
                        mask="date"
                        maxLength={10}
                        error={errors.vaccinationDate}
                      />

                      {showHerdControl && (
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
                                error={errors[`animal_${animal.id}_tag`]}
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
                                error={errors[`animal_${animal.id}_supplementation`]}
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
                                      error={errors[`animal_${animal.id}_weight`]}
                                    />

                                    <Input
                                      label="Data"
                                      required
                                      value={animal.weightDate}
                                      onChangeText={(value) => updateAnimal(animal.id, 'weightDate', value)}
                                      placeholder="xx/xx/xxxx"
                                      mask="date"
                                      maxLength={10}
                                      error={errors[`animal_${animal.id}_weightDate`]}
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
                                          error={errors[`animal_${animal.id}_control_${control.id}_date`]}
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
                                          error={errors[`animal_${animal.id}_control_${control.id}_gain`]}
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
                                        error={errors[`animal_${animal.id}_vaccine_${vaccine.id}_type`]}
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
                                        error={errors[`animal_${animal.id}_vaccine_${vaccine.id}_date`]}
                                      />

                                      <Input
                                        label="Sazonalidade (prazo)"
                                        required
                                        value={vaccine.seasonality}
                                        onChangeText={(value) =>
                                          updateVaccine(animal.id, vaccine.id, 'seasonality', value)
                                        }
                                        placeholder="Ex: Anual, 6 meses, etc."
                                        error={errors[`animal_${animal.id}_vaccine_${vaccine.id}_seasonality`]}
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
                      )}
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
                        error={errors.agricultureTypes}
                        allowCustom
                        customValue={agricultureTypesCustom}
                        onCustomChange={setAgricultureTypesCustom}
                      />

                      <MultiSelect
                        label="Tipo de cultura"
                        required
                        options={cropOptions}
                        selectedValues={cropTypes}
                        onToggle={(value) => toggleMultiSelect(cropTypes, setCropTypes, value)}
                        error={errors.cropTypes}
                        allowCustom
                        customValue={cropTypesCustom}
                        onCustomChange={setCropTypesCustom}
                      />

                      <MultiSelect
                        label="Tipo de semente"
                        required
                        options={seedTypeOptions}
                        selectedValues={seedTypes}
                        onToggle={(value) => toggleMultiSelect(seedTypes, setSeedTypes, value)}
                        error={errors.seedTypes}
                        allowCustom
                        customValue={seedTypesCustom}
                        onCustomChange={setSeedTypesCustom}
                      />

                      <MultiSelect
                        label="Tipo de adubo"
                        required
                        options={fertilizerTypeOptions}
                        selectedValues={fertilizerTypes}
                        onToggle={(value) => toggleMultiSelect(fertilizerTypes, setFertilizerTypes, value)}
                        error={errors.fertilizerTypes}
                        allowCustom
                        customValue={fertilizerTypesCustom}
                        onCustomChange={setFertilizerTypesCustom}
                      />

                      {fertilizerTypes.includes('organico') && (
                        <MultiSelect
                          label="Adubo Orgânico"
                          required
                          options={organicFertilizerOptions}
                          selectedValues={organicFertilizerTypes}
                          onToggle={(value) => toggleMultiSelect(organicFertilizerTypes, setOrganicFertilizerTypes, value)}
                          error={errors.organicFertilizerTypes}
                          allowCustom
                          customValue={organicFertilizerTypesCustom}
                          onCustomChange={setOrganicFertilizerTypesCustom}
                        />
                      )}

                      <MultiSelect
                        label="Tipo de Defensivo"
                        required
                        options={defensiveTypeOptions}
                        selectedValues={defensiveTypes}
                        onToggle={(value) => toggleMultiSelect(defensiveTypes, setDefensiveTypes, value)}
                        error={errors.defensiveTypes}
                        allowCustom
                        customValue={defensiveTypesCustom}
                        onCustomChange={setDefensiveTypesCustom}
                      />

                      <MultiSelect
                        label="Tipo de Calcário"
                        required
                        options={limestoneTypeOptions}
                        selectedValues={limestoneTypes}
                        onToggle={(value) => toggleMultiSelect(limestoneTypes, setLimestoneTypes, value)}
                        error={errors.limestoneTypes}
                        allowCustom
                        customValue={limestoneTypesCustom}
                        onCustomChange={setLimestoneTypesCustom}
                      />
                    </>
                  )}
                </View>
              )}

              {selectedProfiles.includes('supplier') && (
                <View>
                  {selectedProfiles.length > 1 && (
                    <Text style={[styles.profileSectionTitle, { color: colors.text }]}>
                      Dados de {getProfileLabel('supplier')}
                    </Text>
                  )}

                  <Select
                    label="Tipo de Fornecedor"
                    required
                    value={supplierType}
                    onValueChange={handleSupplierTypeChange}
                    options={supplierTypes}
                    placeholder="Selecione o tipo"
                    error={errors.supplierType}
                  />

                  {supplierType && (
                    <>
                      <MultiSelect
                        label="Segmentos"
                        required
                        options={currentSegmentOptions}
                        selectedValues={selectedSegments}
                        onToggle={toggleSegment}
                        error={errors.segments}
                        allowCustom
                        customValue={segmentsCustom}
                        onCustomChange={setSegmentsCustom}
                        itemsPerRow={supplierType === 'comercio' ? 2 : 3}
                      />

                      {selectedSegments.map((segment) => (
                        <View key={segment} style={styles.segmentDataContainer}>
                          <Text style={[styles.segmentDataTitle, { color: colors.text }]}>
                            {getSegmentLabel(segment)}
                          </Text>

                          <MultiSelect
                            label="Produtos/Serviços"
                            options={segmentProductOptions[segment] || []}
                            selectedValues={segmentData[segment]?.products || []}
                            onToggle={(value) => toggleSegmentProduct(segment, value)}
                            allowCustom
                            customValue={segmentData[segment]?.productsCustom || ''}
                            onCustomChange={(value) => updateSegmentCustom(segment, value)}
                          />
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}

              {selectedProfiles.includes('service_provider') && (
                <View>
                  {selectedProfiles.length > 1 && (
                    <Text style={[styles.profileSectionTitle, { color: colors.text }]}>
                      Dados de {getProfileLabel('service_provider')}
                    </Text>
                  )}

                  <MultiSelect
                    label="Segmentos de Serviço"
                    required
                    options={serviceSegmentOptions}
                    selectedValues={selectedServiceSegments}
                    onToggle={toggleServiceSegment}
                    error={errors.serviceSegments}
                    allowCustom
                    customValue={serviceSegmentsCustom}
                    onCustomChange={setServiceSegmentsCustom}
                    itemsPerRow={2}
                  />

                  {selectedServiceSegments.map((segment) => (
                    <View key={segment} style={styles.segmentDataContainer}>
                      <Text style={[styles.segmentDataTitle, { color: colors.text }]}>
                        {getServiceSegmentLabel(segment)}
                      </Text>

                      <MultiSelect
                        label="Serviços Oferecidos"
                        options={serviceSegmentServiceOptions[segment] || []}
                        selectedValues={serviceSegmentData[segment]?.services || []}
                        onToggle={(value) => toggleServiceSegmentService(segment, value)}
                        allowCustom
                        customValue={serviceSegmentData[segment]?.servicesCustom || ''}
                        onCustomChange={(value) => updateServiceSegmentCustom(segment, value)}
                      />
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.buttonBackground, shadowColor: colors.shadowColor }]}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={[styles.continueButtonText, { color: colors.buttonText }]}>
                  Criar conta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLoginRedirect} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: colors.text }]}>
                  Possuo cadastro
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  icon: {
    width: 150,
    height: 150,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 20,
  },
  segmentDataContainer: {
    marginTop: 5,
  },
  segmentDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
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
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
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
  vaccineSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccineSectionHeaderSingle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccineTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  addVaccineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
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
  errorText: {
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
    textAlign: 'center',
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  continueButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
