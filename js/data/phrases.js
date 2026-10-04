/**
 * Banco de frases por defecto.
 * tag: categoría. Podés agregar 'unit5', 'trabajo', 'viaje', etc.
 */
export const CATS = [
  { id:'all',       label:'Todas' },
  { id:'basico',    label:'Básico' },
  { id:'cotidiano', label:'Cotidiano' },
  { id:'viaje',     label:'Viaje' },
  { id:'trabajo',   label:'Trabajo' },
  { id:'phrasal',   label:'Phrasal verbs' },
  { id:'unit5',     label:'Unit 5 · Jobs & Animals' },
  { id:'mias',      label:'Mis frases' }
];

export const DEFAULT_PHRASES = [
  // ---- Jobs / vocabulary
  { id:'u5-j1', en:"marine scientist",  es:"científico marino",  tag:'unit5' },
  { id:'u5-j2', en:"seal",              es:"foca",               tag:'unit5' },
  { id:'u5-j3', en:"sheep farmer",      es:"granjero de ovejas", tag:'unit5' },
  { id:'u5-j4', en:"sheep dog",         es:"perro ovejero",      tag:'unit5' },
  { id:'u5-j5', en:"fisherman",         es:"pescador",           tag:'unit5' },
  { id:'u5-j6', en:"bottlenose dolphin",es:"delfín mular",       tag:'unit5' },
  { id:'u5-j7', en:"ambulance driver",  es:"conductor de ambulancia", tag:'unit5' },
  { id:'u5-j8', en:"firefighter",       es:"bombero",            tag:'unit5' },
  { id:'u5-j9', en:"journalist",        es:"periodista",         tag:'unit5' },
  { id:'u5-j10',en:"nurse",             es:"enfermero/a",        tag:'unit5' },
  { id:'u5-j11',en:"photographer",      es:"fotógrafo",          tag:'unit5' },
  { id:'u5-j12',en:"pilot",             es:"piloto",             tag:'unit5' },
  { id:'u5-j13',en:"police officer",    es:"oficial de policía", tag:'unit5' },
  { id:'u5-j14',en:"pop star",          es:"estrella del pop",   tag:'unit5' },
  { id:'u5-j15',en:"waiter",            es:"camarero",           tag:'unit5' },
  { id:'u5-j16',en:"web designer",      es:"diseñador web",      tag:'unit5' },

  // ---- Unit 5 oraciones
  { id:'u5-s1', en:"Yesterday afternoon at twenty to four, firefighters were saving people from a top floor.", es:"Ayer por la tarde a las cuatro menos veinte, los bomberos estaban rescatando a personas de un piso alto.", tag:'unit5' },
  { id:'u5-s2', en:"A journalist was reporting.", es:"Un periodista estaba reportando.", tag:'unit5' },
  { id:'u5-s3', en:"An ambulance driver was there.", es:"Un conductor de ambulancia estaba allí.", tag:'unit5' },
  { id:'u5-s4', en:"A nurse was helping a child.", es:"Una enfermera estaba ayudando a un niño.", tag:'unit5' },
  { id:'u5-s5', en:"There was a cloud of smoke in the air. We were there, too. We saw it all.", es:"Había una nube de humo en el aire. Nosotros también estábamos allí. Lo vimos todo.", tag:'unit5' },
  { id:'u5-s6', en:"We were buying fruit from a fruit and veg stall.", es:"Estábamos comprando fruta en un puesto de frutas y verduras.", tag:'unit5' },
  { id:'u5-s7', en:"People who work in emergency services, such as police officers, ambulance drivers or firefighters, have to be ready 24 hours a day because emergencies don't only happen in the daytime.", es:"Las personas que trabajan en servicios de emergencia, como oficiales de policía, conductores de ambulancias o bomberos, tienen que estar listas las 24 horas del día porque las emergencias no solo ocurren durante el día.", tag:'unit5' },
  { id:'u5-s8', en:"Do you know people who work at night?", es:"¿Conoces a personas que trabajan de noche?", tag:'unit5' },
  { id:'u5-s9', en:"What do they do?", es:"¿Qué hacen?", tag:'unit5' },
  { id:'u5-s10',en:"My brother is a coast guard.", es:"Mi hermano es guardacostas.", tag:'unit5' },
  { id:'u5-s11',en:"Last night at midnight, he wasn't sleeping like you and me.", es:"Anoche a medianoche, él no estaba durmiendo como tú y yo.", tag:'unit5' },
  { id:'u5-s12',en:"He was looking for a boat that was lost at sea.", es:"Estaba buscando un barco que se había perdido en el mar.", tag:'unit5' },
  { id:'u5-s13',en:"In September last year, there were terrible storms and floods in the UK.", es:"En septiembre del año pasado, hubo terribles tormentas e inundaciones en el Reino Unido.", tag:'unit5' },
  { id:'u5-s14',en:"My family and our neighbours had to leave our homes in the middle of the night.", es:"Mi familia y nuestros vecinos tuvieron que dejar nuestras casas en medio de la noche.", tag:'unit5' },
  { id:'u5-s15',en:"At one o'clock in the morning, the firefighters and medical workers were helping us.", es:"A la una de la mañana, los bomberos y los trabajadores médicos nos estaban ayudando.", tag:'unit5' },
  { id:'u5-s16',en:"We were very grateful to them.", es:"Estábamos muy agradecidos con ellos.", tag:'unit5' },
  { id:'u5-s17',en:"In the past, farmers used horses and oxen to plough fields.", es:"En el pasado, los granjeros usaban caballos y bueyes para arar los campos.", tag:'unit5' },
  { id:'u5-s18',en:"Builders used donkeys to move materials.", es:"Los constructores usaban burros para mover materiales.", tag:'unit5' },
  { id:'u5-s19',en:"Today, we usually use machines and vehicles to do these jobs.", es:"Hoy en día, normalmente usamos máquinas y vehículos para hacer estos trabajos.", tag:'unit5' },
  { id:'u5-s20',en:"But some animals still help professional people with their work.", es:"Pero algunos animales todavía ayudan a los profesionales con su trabajo.", tag:'unit5' },
  { id:'u5-s21',en:"It's difficult for marine scientists to measure the temperature of sea water in the Antarctic, especially 500 m below the sea level.", es:"Es difícil para los científicos marinos medir la temperatura del agua de mar en la Antártida, especialmente 500 m bajo el nivel del mar.", tag:'unit5' },
  { id:'u5-s22',en:"But seals can help the scientists.", es:"Pero las focas pueden ayudar a los científicos.", tag:'unit5' },
  { id:'u5-s23',en:"They put sensors on the heads of a small number of seals.", es:"Colocan sensores en las cabezas de un pequeño número de focas.", tag:'unit5' },
  { id:'u5-s24',en:"When these seals swim underwater, the sensors record the temperature.", es:"Cuando estas focas nadan bajo el agua, los sensores registran la temperatura.", tag:'unit5' },
  { id:'u5-s25',en:"When they come to the surface, the information goes from the sensor to a satellite.", es:"Cuando salen a la superficie, la información va del sensor a un satélite.", tag:'unit5' },
  { id:'u5-s26',en:"The sensors fall off the seals' heads after about a year.", es:"Los sensores se caen de las cabezas de las focas después de aproximadamente un año.", tag:'unit5' },
  { id:'u5-s27',en:"In the UK, sheep dogs help farmers to move a flock of sheep from one field to another.", es:"En el Reino Unido, los perros ovejeros ayudan a los granjeros a mover un rebaño de ovejas de un campo a otro.", tag:'unit5' },
  { id:'u5-s28',en:"The dogs are intelligent and athletic.", es:"Los perros son inteligentes y atléticos.", tag:'unit5' },
  { id:'u5-s29',en:"They can respond to the farmer's instructions.", es:"Pueden responder a las instrucciones del granjero.", tag:'unit5' },
  { id:'u5-s30',en:"They run around a flock quickly and make the sheep move.", es:"Corren alrededor de un rebaño rápidamente y hacen que las ovejas se muevan.", tag:'unit5' },
  { id:'u5-s31',en:"In a bay on the coast of Brazil, bottlenose dolphins help fishermen to catch fish.", es:"En una bahía en la costa de Brasil, los delfines mulares ayudan a los pescadores a atrapar peces.", tag:'unit5' },
  { id:'u5-s32',en:"The dolphins swim around groups of fish and make them swim towards the fishermen.", es:"Los delfines nadan alrededor de grupos de peces y los hacen nadar hacia los pescadores.", tag:'unit5' },
  { id:'u5-s33',en:"Then the dolphins make a signal with their tails, and the fishermen throw their nets, catching lots of fish.", es:"Entonces los delfines hacen una señal con sus colas, y los pescadores lanzan sus redes, atrapando muchos peces.", tag:'unit5' },
  { id:'u5-s34',en:"The dolphins also benefit because they can easily catch the individual fish which escape from the nets.", es:"Los delfines también se benefician porque pueden atrapar fácilmente los peces individuales que escapan de las redes.", tag:'unit5' },
  { id:'u5-s35',en:"Importantly, these animals don't suffer when they help these professional people.", es:"Es importante destacar que estos animales no sufren cuando ayudan a estos profesionales.", tag:'unit5' },

  // ---- Storm damage
  { id:'u5-st1',en:"STORM DAMAGE IN THE NORTH", es:"DAÑOS POR LA TORMENTA EN EL NORTE", tag:'unit5' },
  { id:'u5-st2',en:"At the weekend, thunderstorms surprised everyone in the North of England.", es:"El fin de semana, las tormentas eléctricas sorprendieron a todos en el norte de Inglaterra.", tag:'unit5' },
  { id:'u5-st3',en:"The storms started at ten o'clock on Saturday morning and they didn't stop until eight o'clock on Sunday evening.", es:"Las tormentas comenzaron a las diez de la mañana del sábado y no pararon hasta las ocho de la tarde del domingo.", tag:'unit5' },
  { id:'u5-st4',en:"No one was prepared for wind and rain in the middle of the summer.", es:"Nadie estaba preparado para el viento y la lluvia en medio del verano.", tag:'unit5' },
  { id:'u5-st5',en:"I was walking in the hills when the storm started, said Dale Perry.", es:"Estaba caminando en las colinas cuando comenzó la tormenta, dijo Dale Perry.", tag:'unit5' },
  { id:'u5-st6',en:"I was wearing a T-shirt and shorts.", es:"Llevaba una camiseta y pantalones cortos.", tag:'unit5' },
  { id:'u5-st7',en:"The people of Catterick village were preparing a summer fair when winds of 98 km an hour destroyed everything.", es:"La gente del pueblo de Catterick estaba preparando una feria de verano cuando vientos de 98 km por hora lo destruyeron todo.", tag:'unit5' },
  { id:'u5-st8',en:"We're all very disappointed, said Mrs Wilson, a teacher at Catterick Primary School.", es:"Todos estamos muy decepcionados, dijo la señora Wilson, una maestra en la escuela primaria de Catterick.", tag:'unit5' },
  { id:'u5-st9',en:"After a worrying weekend, on Monday morning the sun was shining and people were starting to repair the damage.", es:"Después de un fin de semana preocupante, el lunes por la mañana el sol brillaba y la gente estaba comenzando a reparar los daños.", tag:'unit5' },

  // ---- Básico (algunos sueltos)
  { id:'b1', en:"I am learning English every day.", es:"Estoy aprendiendo inglés todos los días.", tag:'basico' },
  { id:'b2', en:"She doesn't like coffee in the morning.", es:"A ella no le gusta el café por la mañana.", tag:'basico' },
  { id:'b3', en:"Where are you from originally?", es:"¿De dónde sos originalmente?", tag:'basico' },
  { id:'c1', en:"Could you turn down the music, please?", es:"¿Podrías bajar la música, por favor?", tag:'cotidiano' },
  { id:'v1', en:"Excuse me, how do I get to the train station?", es:"Disculpe, ¿cómo llego a la estación de tren?", tag:'viaje' },
  { id:'w1', en:"Let's schedule a meeting for next Tuesday.", es:"Agendemos una reunión para el próximo martes.", tag:'trabajo' },
  { id:'p1', en:"I need to figure out how this thing works.", es:"Necesito descubrir cómo funciona esta cosa.", tag:'phrasal' }
];