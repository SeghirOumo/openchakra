const CONTENTS_ARTICLE= 'ARTICLE'
const CONTENTS_INFOGRAPHY='INFOGRAPHY'
const CONTENTS_VIDEO='VIDEO'
const CONTENTS_PODCAST='PODCAST'

const CONTENTS_TYPE = {
  [CONTENTS_ARTICLE]:'Article',
  [CONTENTS_VIDEO]:'Vidéo',
  [CONTENTS_INFOGRAPHY]:'Infographie',
  [CONTENTS_PODCAST]:'Podcast',
}

const EVENT_MENU= 'MENU'
const EVENT_IND_CHALLENGE='IND_CHALLENGE'
const EVENT_COLL_CHALLENGE='COLL_CHALLENGE'
const EVENT_WEBINAR='WEBINAR'

const EVENT_TYPE = {
  [EVENT_MENU]:'Menu',
  [EVENT_IND_CHALLENGE]:'Challenge individuel',
  [EVENT_COLL_CHALLENGE]:'Challenge collectif',
  [EVENT_WEBINAR]:'Webinaire',
}

const ROLE_CUSTOMER='CUSTOMER'
const ROLE_RH='RH'
const ROLE_DIET='DIET'
const ROLE_EXTERNAL_DIET='EXTERNAL_DIET'
const ROLE_SUPER_ADMIN='SUPER_ADMIN'
const ROLE_ADMIN='ADMIN'
const ROLE_SUPPORT='SUPPORT'

const ROLES={
  [ROLE_CUSTOMER]:'Abonné',
  [ROLE_RH]:'RH',
  [ROLE_DIET]:'Diététicien(ne)',
  [ROLE_EXTERNAL_DIET]:'Diététicien(ne) externe',
  [ROLE_SUPER_ADMIN]:'Superadministrateur',
  [ROLE_ADMIN]:'Administrateur',
  [ROLE_SUPPORT]:'Support',
}

const GENDER_MALE='MALE'
const GENDER_FEMALE='FEMALE'
const GENDER_NON_BINARY='NON_BINARY'

const GENDER = {
  [GENDER_MALE]:'Homme',
  [GENDER_FEMALE]:'Femme',
  [GENDER_NON_BINARY]:'Non genré',
}

const ACT_ACTIVE='ACTIVE'
const ACT_STUDENT='STUDENT'
const ACT_RETIRED='RETIRED'
const ACT_OTHER='OTHER'

const ACTIVITY={
  [ACT_ACTIVE]:'Actif',
  [ACT_STUDENT]:'Etudiant',
  [ACT_RETIRED]:'En retraite',
  [ACT_OTHER]:'Autre',
}

const TARGET_OBJECTIVE='OBJECTIVE'
const TARGET_SPECIFICITY='SPECIFICITY'
const TARGET_ACTIVITY='ACTIVITY'
const TARGET_HOME='HOME'
const TARGET_HEALTH='HEALTH'

const TARGET_TYPE={
  [TARGET_OBJECTIVE]:'Objectif',
  [TARGET_SPECIFICITY]:'Spécificité',
  [TARGET_ACTIVITY]:'Activité',
  [TARGET_HOME]:'Foyer',
  [TARGET_HEALTH]:'Santé',
}

const COMPANY_ACTIVITY_AGROALIMENTAIRE='COMPANY_ACTIVITY_AGROALIMENTAIRE'
const COMPANY_ACTIVITY_BANQUE='COMPANY_ACTIVITY_BANQUE'
const COMPANY_ACTIVITY_ASSURANCE='COMPANY_ACTIVITY_ASSURANCE'
const COMPANY_ACTIVITY_BOIS='COMPANY_ACTIVITY_BOIS'
const COMPANY_ACTIVITY_PAPIER='COMPANY_ACTIVITY_PAPIER'
const COMPANY_ACTIVITY_CARTON='COMPANY_ACTIVITY_CARTON'
const COMPANY_ACTIVITY_IMPRIMERIE='COMPANY_ACTIVITY_IMPRIMERIE'
const COMPANY_ACTIVITY_BTP='COMPANY_ACTIVITY_BTP'
const COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION='COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION'
const COMPANY_ACTIVITY_CHIMIE='COMPANY_ACTIVITY_CHIMIE'
const COMPANY_ACTIVITY_PARACHIMIE='COMPANY_ACTIVITY_PARACHIMIE'
const COMPANY_ACTIVITY_COMMERCE='COMPANY_ACTIVITY_COMMERCE'
const COMPANY_ACTIVITY_NEGOCE='COMPANY_ACTIVITY_NEGOCE'
const COMPANY_ACTIVITY_DISTRIBUTION='COMPANY_ACTIVITY_DISTRIBUTION'
const COMPANY_ACTIVITY_EDITION='COMPANY_ACTIVITY_EDITION'
const COMPANY_ACTIVITY_COMMUNICATION='COMPANY_ACTIVITY_COMMUNICATION'
const COMPANY_ACTIVITY_MULTIMEDIA='COMPANY_ACTIVITY_MULTIMEDIA'
const COMPANY_ACTIVITY_ELECTRONIQUE='COMPANY_ACTIVITY_ELECTRONIQUE'
const COMPANY_ACTIVITY_ELECTRICITE='COMPANY_ACTIVITY_ELECTRICITE'
const COMPANY_ACTIVITY_ETUDES_ET_CONSEILS='COMPANY_ACTIVITY_ETUDES_ET_CONSEILS'
const COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE='COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE'
const COMPANY_ACTIVITY_INFORMATIQUE='COMPANY_ACTIVITY_INFORMATIQUE'
const COMPANY_ACTIVITY_TELECOMS='COMPANY_ACTIVITY_TELECOMS'
const COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS='COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS'
const COMPANY_ACTIVITY_AUTOMOBILE='COMPANY_ACTIVITY_AUTOMOBILE'
const COMPANY_ACTIVITY_METALLURGIE='COMPANY_ACTIVITY_METALLURGIE'
const COMPANY_ACTIVITY_TRAVAIL_DU_METAL='COMPANY_ACTIVITY_TRAVAIL_DU_METAL'
const COMPANY_ACTIVITY_PLASTIQUE='COMPANY_ACTIVITY_PLASTIQUE'
const COMPANY_ACTIVITY_CAOUTCHOUC='COMPANY_ACTIVITY_CAOUTCHOUC'
const COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES='COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES'
const COMPANY_ACTIVITY_TEXTILE='COMPANY_ACTIVITY_TEXTILE'
const COMPANY_ACTIVITY_HABILLEMENT='COMPANY_ACTIVITY_HABILLEMENT'
const COMPANY_ACTIVITY_CHAUSSURE='COMPANY_ACTIVITY_CHAUSSURE'
const COMPANY_ACTIVITY_TRANSPORTS='COMPANY_ACTIVITY_TRANSPORTS'
const COMPANY_ACTIVITY_LOGISTIQUE='COMPANY_ACTIVITY_LOGISTIQUE'

const COMPANY_ACTIVITY={
  [COMPANY_ACTIVITY_AGROALIMENTAIRE]:'Agroalimentaire',
  [COMPANY_ACTIVITY_BANQUE]:'Banque',
  [COMPANY_ACTIVITY_ASSURANCE]:'Assurance',
  [COMPANY_ACTIVITY_BOIS]:'Bois',
  [COMPANY_ACTIVITY_PAPIER]:'Papier',
  [COMPANY_ACTIVITY_CARTON]:'Carton',
  [COMPANY_ACTIVITY_IMPRIMERIE]:'Imprimerie',
  [COMPANY_ACTIVITY_BTP]:'BTP',
  [COMPANY_ACTIVITY_MATERIAUX_DE_CONSTRUCTION]:'Matériaux de construction',
  [COMPANY_ACTIVITY_CHIMIE]:'Chimie',
  [COMPANY_ACTIVITY_PARACHIMIE]:'Parachimie',
  [COMPANY_ACTIVITY_COMMERCE]:'Commerce',
  [COMPANY_ACTIVITY_NEGOCE]:'Négoce',
  [COMPANY_ACTIVITY_DISTRIBUTION]:'Distribution',
  [COMPANY_ACTIVITY_EDITION]:'Édition',
  [COMPANY_ACTIVITY_COMMUNICATION]:'Communication',
  [COMPANY_ACTIVITY_MULTIMEDIA]:'Multimédia',
  [COMPANY_ACTIVITY_ELECTRONIQUE]:'Électronique',
  [COMPANY_ACTIVITY_ELECTRICITE]:'Électricité',
  [COMPANY_ACTIVITY_ETUDES_ET_CONSEILS]:'Études et conseils',
  [COMPANY_ACTIVITY_INDUSTRIE_PHARMACEUTIQUE]:'Industrie pharmaceutique',
  [COMPANY_ACTIVITY_INFORMATIQUE]:'Informatique',
  [COMPANY_ACTIVITY_TELECOMS]:'Télécoms',
  [COMPANY_ACTIVITY_MACHINES_ET_EQUIPEMENTS]:'Machines et équipements',
  [COMPANY_ACTIVITY_AUTOMOBILE]:'Automobile',
  [COMPANY_ACTIVITY_METALLURGIE]:'Métallurgie',
  [COMPANY_ACTIVITY_TRAVAIL_DU_METAL]:'Travail du métal',
  [COMPANY_ACTIVITY_PLASTIQUE]:'Plastique',
  [COMPANY_ACTIVITY_CAOUTCHOUC]:'Caoutchouc',
  [COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES]:'Services aux entreprises',
  [COMPANY_ACTIVITY_TEXTILE]:'Textile',
  [COMPANY_ACTIVITY_HABILLEMENT]:'Habillement',
  [COMPANY_ACTIVITY_CHAUSSURE]:'Chaussure',
  [COMPANY_ACTIVITY_TRANSPORTS]:'Transports',
  [COMPANY_ACTIVITY_LOGISTIQUE]:'Logistique',
}

const SPOON_SOURCE_PROFILE_COMPLETED='SPOON_SOURCE_PROFILE_COMPLETED'
const SPOON_SOURCE_CONTENT_READ='SPOON_SOURCE_CONTENT_READ'
const SPOON_SOURCE_CONTENT_EXT_SHARED='SPOON_SOURCE_CONTENT_EXT_SHARED'
const SPOON_SOURCE_CONTENT_LIKE='SPOON_SOURCE_CONTENT_LIKE'
const SPOON_SOURCE_CONTENT_DOWNLOADED='SPOON_SOURCE_CONTENT_DOWNLOADED'
const SPOON_SOURCE_CONTENT_PINNED='SPOON_SOURCE_CONTENT_PINNED'
const SPOON_SOURCE_CONTENT_COMMENT='SPOON_SOURCE_CONTENT_COMMENT'
const SPOON_SOURCE_GROUP_MESSAGE='SPOON_SOURCE_GROUP_MESSAGE'
const SPOON_SOURCE_GROUP_LIKE='SPOON_SOURCE_GROUP_LIKE'
const SPOON_SOURCE_GROUP_JOIN='SPOON_SOURCE_GROUP_JOIN'
const SPOON_SOURCE_WEBINAR_LIVE='SPOON_SOURCE_WEBINAR_LIVE'
const SPOON_SOURCE_WEBINAR_REPLAY='SPOON_SOURCE_WEBINAR_REPLAY'
const SPOON_SOURCE_SURVEY_DONE='SPOON_SOURCE_SURVEY_DONE'
const SPOON_SOURCE_SURVEY_PASSED='SPOON_SOURCE_SURVEY_PASSED'
const SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED='SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED'
const SPOON_SOURCE_MEASURE_CHEST='SPOON_SOURCE_MEASURE_CHEST'
const SPOON_SOURCE_MEASURE_WAIST='SPOON_SOURCE_MEASURE_WAIST'
const SPOON_SOURCE_MEASURE_HIPS='SPOON_SOURCE_MEASURE_HIPS'
const SPOON_SOURCE_MEASURE_THIGHS='SPOON_SOURCE_MEASURE_THIGHS'
const SPOON_SOURCE_MEASURES_ARMS='SPOON_SOURCE_MEASURES_ARMS'
const SPOON_SOURCE_MEASURE_WEIGHT='SPOON_SOURCE_MEASURE_WEIGHT'

const SPOON_SOURCE={
  [SPOON_SOURCE_PROFILE_COMPLETED]:'profile_completed',
  [SPOON_SOURCE_CONTENT_READ]:'content_read',
  [SPOON_SOURCE_CONTENT_EXT_SHARED]:'content_ext_shared',
  [SPOON_SOURCE_CONTENT_LIKE]:'content_like',
  [SPOON_SOURCE_CONTENT_DOWNLOADED]:'content_downloaded',
  [SPOON_SOURCE_CONTENT_PINNED]:'content_pinned',
  [SPOON_SOURCE_CONTENT_COMMENT]:'content_comment',
  [SPOON_SOURCE_GROUP_MESSAGE]:'group_message',
  [SPOON_SOURCE_GROUP_LIKE]:'group_like',
  [SPOON_SOURCE_GROUP_JOIN]:'group_join',
  [SPOON_SOURCE_WEBINAR_LIVE]:'webinar_live',
  [SPOON_SOURCE_WEBINAR_REPLAY]:'webinar_replay',
  [SPOON_SOURCE_SURVEY_DONE]:'survey_done',
  [SPOON_SOURCE_SURVEY_PASSED]:'survey_passed',
  [SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED]:'individual_challenge_passed',
  [SPOON_SOURCE_MEASURE_CHEST]:'measure_chest',
  [SPOON_SOURCE_MEASURE_WAIST]:'measure_waist',
  [SPOON_SOURCE_MEASURE_HIPS]:'measure_hips',
  [SPOON_SOURCE_MEASURE_THIGHS]:'measure_thighs',
  [SPOON_SOURCE_MEASURES_ARMS]:'measures_arms',
  [SPOON_SOURCE_MEASURE_WEIGHT]:'measure_weight',
}

// Discriminator for mongoose products
const EVENT_DISCRIMINATOR = {discriminatorKey:'kind'}

const HARDNESS_EASY='EASY'
const HARDNESS_HARD='HARD'

const HARDNESS={
  [HARDNESS_EASY]:'Du gâteau',
  [HARDNESS_HARD]:'De la tarte',
}

const GROUPS_CREDIT_ONE='GROUPS_CREDIT_ONE'
const GROUPS_CREDIT_UNLIMITED='GROUPS_CREDIT_UNLIMITED'

const GROUPS_CREDIT={
 [GROUPS_CREDIT_ONE]:'Un groupe',
 [GROUPS_CREDIT_UNLIMITED]:'Groupes illimités',
}

const NUTRISCORE_A='NUTRISCORE_A'
const NUTRISCORE_B='NUTRISCORE_B'
const NUTRISCORE_C='NUTRISCORE_C'
const NUTRISCORE_D='NUTRISCORE_D'
const NUTRISCORE_E='NUTRISCORE_E'

const NUTRISCORE={
  [NUTRISCORE_A]:'A',
  [NUTRISCORE_B]:'B',
  [NUTRISCORE_C]:'C',
  [NUTRISCORE_D]:'D',
  [NUTRISCORE_E]:'E',
}

const ECOSCORE_A='ECOSCORE_A'
const ECOSCORE_B='ECOSCORE_B'
const ECOSCORE_C='ECOSCORE_C'
const ECOSCORE_D='ECOSCORE_D'
const ECOSCORE_E='ECOSCORE_E'

const ECOSCORE={
 [ECOSCORE_A]:'A',
 [ECOSCORE_B]:'B',
 [ECOSCORE_C]:'C',
 [ECOSCORE_D]:'D',
 [ECOSCORE_E]:'E',
}

const UNIT_KG='UNIT_KG'
const UNIT_L='UNIT_L'
const UNIT_DOUZAINE='UNIT_DOUZAINE'
const UNIT_CUILLERE_A_SOUPE='UNIT_CUILLERE_A_SOUPE'
const UNIT_CUILLERE_A_CAFE='UNIT_CUILLERE_A_CAFE'
const UNIT_ML='UNIT_ML'
const UNIT_CL='UNIT_CL'
const UNIT_DL='UNIT_DL'
const UNIT_G='UNIT_G'
const UNIT_LIVRE='UNIT_LIVRE'
const UNIT_PINCEE='UNIT_PINCEE'
const UNIT_VERRE_A_MOUTARDE='UNIT_VERRE_A_MOUTARDE'
const UNIT_LOUCHE='UNIT_LOUCHE'
const UNIT_FILET='UNIT_FILET'
const UNIT_NOISETTE='UNIT_NOISETTE'
const UNIT_POIGNEE='UNIT_POIGNEE'
const UNIT_MIGNONETTE='UNIT_MIGNONETTE'
const UNIT_SACHET='UNIT_SACHET'
const UNIT_UNITE='UNIT_UNITE'

const UNIT={
 [UNIT_KG]:'kg',
 [UNIT_L]:'l',
 [UNIT_DOUZAINE]:'douzaine',
 [UNIT_CUILLERE_A_SOUPE]:'cuillère à soupe',
 [UNIT_CUILLERE_A_CAFE]:'cuillère à café',
 [UNIT_ML]:'ml',
 [UNIT_CL]:'cl',
 [UNIT_DL]:'dl',
 [UNIT_G]:'g',
 [UNIT_LIVRE]:'livre',
 [UNIT_PINCEE]:'pincée',
 [UNIT_VERRE_A_MOUTARDE]:'verre à moutarde',
 [UNIT_LOUCHE]:'louche',
 [UNIT_FILET]:'filet',
 [UNIT_NOISETTE]:'noisette',
 [UNIT_POIGNEE]:'poignée',
 [UNIT_MIGNONETTE]:'mignonette',
 [UNIT_SACHET]:'sachet',
 [UNIT_UNITE]:'unité',
}

const PARTICULAR_COMPANY_NAME='Adhérent particulier'

const SURVEY_ANSWER_NEVER='0'
const SURVEY_ANSWER_SOMETIMES='1'
const SURVEY_ANSWER_OFTEN='2'
const SURVEY_ANSWER_ALWAYS='3'

const SURVEY_ANSWER={
  [SURVEY_ANSWER_NEVER]:'jamais',
  [SURVEY_ANSWER_SOMETIMES]:'parfois',
  [SURVEY_ANSWER_OFTEN]:'souvent',
  [SURVEY_ANSWER_ALWAYS]:'toujours',
}

const DAYS_MONDAY='0'
const DAYS_TUESDAY='1'
const DAYS_WEDNESDAY='2'
const DAYS_THURSDAY='3'
const DAYS_FRIDAY='4'
const DAYS_SATURDAY='5'
const DAYS_SUNDAY='6'

const DAYS={
 [DAYS_MONDAY]:'Lundi',
 [DAYS_TUESDAY]:'Mardi',
 [DAYS_WEDNESDAY]:'Mercredi',
 [DAYS_THURSDAY]:'Jeudi',
 [DAYS_FRIDAY]:'Vendredi',
 [DAYS_SATURDAY]:'Samedi',
 [DAYS_SUNDAY]:'Dimanche',
}

const PERIOD_NOON='0'
const PERIOD_EVENING='1'

const PERIOD={
 [PERIOD_NOON]:'Déjeuner',
 [PERIOD_EVENING]:'Dîner',
}

const NO_CREDIT_AVAILABLE=`Votre crédit est épuisé ou votre offre ne permet pas l'accès`

const COACHING_QUESTION_STATUS_NOT_ADDRESSED="COACHING_QUESTION_STATUS_NOT_ADDRESSED"
const COACHING_QUESTION_STATUS_NOT_ACQUIRED="COACHING_QUESTION_STATUS_NOT_ACQUIRED"
const COACHING_QUESTION_STATUS_IN_PROGRESS="COACHING_QUESTION_STATUS_IN_PROGRESS"
const COACHING_QUESTION_STATUS_ACQUIRED="COACHING_QUESTION_STATUS_ACQUIRED"

const COACHING_QUESTION_STATUS={
 [COACHING_QUESTION_STATUS_NOT_ADDRESSED]:"Non abordé",
 [COACHING_QUESTION_STATUS_NOT_ACQUIRED]:"Non acquis",
 [COACHING_QUESTION_STATUS_IN_PROGRESS]:"En cours d'acquisition",
 [COACHING_QUESTION_STATUS_ACQUIRED]:"Acquis",
}

module.exports={
  CONTENTS_TYPE,
  EVENT_TYPE,
  ROLES,
  GENDER,
  ACTIVITY,
  TARGET_TYPE,
  COMPANY_ACTIVITY,
  COMPANY_ACTIVITY_BANQUE,
  COMPANY_ACTIVITY_SERVICES_AUX_ENTREPRISES,
  ROLE_CUSTOMER, ROLE_ADMIN, ROLE_RH,
  SPOON_SOURCE,
  EVENT_DISCRIMINATOR,
  EVENT_COLL_CHALLENGE,
  EVENT_IND_CHALLENGE,
  EVENT_MENU,
  EVENT_WEBINAR,
  HARDNESS,
  GROUPS_CREDIT,
  NUTRISCORE,
  ECOSCORE,
  UNIT,
  PARTICULAR_COMPANY_NAME,
  SURVEY_ANSWER,
  DAYS,
  PERIOD,
  // TODO: how to export all SPOON_SOURCE keys in one line ?
  SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED,
  SPOON_SOURCE_CONTENT_LIKE,
  SPOON_SOURCE_CONTENT_READ,
  SPOON_SOURCE_CONTENT_PINNED,
  SPOON_SOURCE_GROUP_JOIN,
  SPOON_SOURCE_GROUP_MESSAGE,
  SPOON_SOURCE_GROUP_LIKE,
  SPOON_SOURCE_CONTENT_COMMENT,
  SPOON_SOURCE_INDIVIDUAL_CHALLENGE_PASSED,
  SPOON_SOURCE_MEASURE_CHEST,
  SPOON_SOURCE_MEASURE_WAIST,
  SPOON_SOURCE_MEASURE_HIPS,
  SPOON_SOURCE_MEASURE_THIGHS,
  SPOON_SOURCE_MEASURES_ARMS,
  SPOON_SOURCE_MEASURE_WEIGHT,
  SPOON_SOURCE_SURVEY_DONE,
  SPOON_SOURCE_SURVEY_PASSED,
  SPOON_SOURCE_WEBINAR_LIVE,
  SPOON_SOURCE_WEBINAR_REPLAY,
  CONTENTS_ARTICLE, CONTENTS_INFOGRAPHY, CONTENTS_VIDEO, CONTENTS_PODCAST,
  NO_CREDIT_AVAILABLE,
  COACHING_QUESTION_STATUS, COACHING_QUESTION_STATUS_NOT_ADDRESSED,
}
