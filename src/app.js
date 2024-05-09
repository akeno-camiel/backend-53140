import express from "express";
import path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";

import { router as vistasRouter } from './routes/vistas.router.js';
import { router as cartRouter } from './routes/cartRouter.js';
import { router as productRouter } from './routes/productRouter.js';
import { messageModelo } from "./dao/models/messageModelo.js";
import { productsModelo } from "./dao/models/productsModelo.js";


const PORT = 8080;
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', vistasRouter);
app.use('/api/product', productRouter);
app.use('/api/carts', cartRouter);

let usuarios = [];

const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});



export const io = new Server(server);

io.on("connection", (socket) => { 
    console.log(`Se conecto el cliente ${socket.id}`)

    socket.on("id", async (userName) => {
        usuarios[socket.id] = userName;
        let messages = await messageModelo.find()
        socket.emit("previousMessages", messages)
        socket.broadcast.emit("newUser", userName)
    })

    socket.on("newMessage", async (userName, message) => {
        await messageModelo.create({ user: userName, message: message })
        io.emit("sendMessage", userName, message)
    })

    socket.on("disconnect", () => {
        const userName = usuarios[socket.id];
        delete usuarios[socket.id];
        if (userName) {
            io.emit("userDisconnected", userName);
        }
    })
})

const connDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://akenocamiel:CoderCoder@cluster0.bqr5bqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            {
                dbName: "eCommerce"
            }
        )
        console.log("Mongoose activo")

        // let products = [
        //     {
        //         "title": "HD HDD 2TB WD BLACK SATA III 3.5'",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/hd-hdd-2tb-wd-black-sata-iii-35-0.jpg",
        //         "price": 186030,
        //         "category": "discosrigidos",

        //         "description": "Los discos duros WD Black se han diseñado para usuarios de ordenadores de sobremesa y usuarios avanzados que demandan rendimiento, con múltiples opciones de actualización disponibles. Los discos WD Black ofrecen un excelente rendimiento para almacenar grandes archivos multimedia de fotos, vídeos y aplicaciones. Optimizado para el rendimiento y perfecto para el juego. Los discos WD Black ofrecen grandes capacidades para guardar su creciente colección de videojuegos.",
        //         "stock": 25
        //     },
        //     {
        //         "title": "HD HDD 2TB SEAGATE SKYHAWK SATA III 3.5'",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/hd-hdd-2tb-seagate-skyhawk-sata-iii-35-0.jpg",
        //         "price": 119870,
        //         "category": "discosrigidos",

        //         "description": "Disfruta de una velocidad y rendimiento de nueva generación con nuestra biblioteca digital más grande hasta la fecha. Disfruta de mundos más dinámicos y tiempos de carga más rápidos, y agrega Xbox Game Pass Ultimate (la suscripción se vende por separado) para jugar a títulos nuevos el mismo día de su lanzamiento. Además, disfruta de cientos de juegos de alta calidad, como Minecraft, Forza Horizon 5 y Halo Infinite, con amigos en consola, PC y la nube.",
        //         "stock": 14
        //     },
        //     {
        //         "title": "HD HDD 4TB SEAGATE SKYHAWK SATA III 3.5'",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/hd-hdd-4tb-seagate-skyhawk-sata-iii-35-0.jpg",
        //         "price": 146400,
        //         "category": "discosrigidos",

        //         "description": "Optimizadas para sistemas de DVR y NVR, las unidades de vigilancia SkyHawk™ han sido perfeccionadas para cargas de trabajo ininterrumpidas en capacidades de hasta 10 TB. Equipada con el firmware expandido ImagePerfect™, SkyHawk le ayuda a reducir el número de fotogramas perdidos y el tiempo de inactividad con una calificación operative el triple de una unidad de sobremesa y VIENE lista para grabar hasta 90 % del tiempo, a la vez que admite hasta 64 cámaras en HD.",
        //         "stock": 18
        //     },
        //     {
        //         "title": "HD USB 4TB WD ELEMENTS EXTERNO",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/hd-usb-4tb-wd-elements-externo-0.jpg",
        //         "price": 152750,
        //         "category": "discosrigidos",

        //         "description": "Una espaciosa capacidad de 4 TB en una sola unidad portátil y compacta para su biblioteca digital en crecimiento: alta calidad, almacenamiento portátil realzado por un duradero diseño y una fiabilidad excepcional. Es su vida. Guárdela en un solo lugar. Unidad pequeña con amplio almacenamiento para su vida digital en su computadora y dispositivos móviles. Western Digital 4TB Elements Portable External Hard Drive - USB 3.0 - WDBU6Y0040BBK-WESN. Disco Portátil USB 3.0 de 4TB. Simple, rápido y portátil. Almacenamiento fiable y de alta capacidad, todo en un elegante diseño. Conexión USB 3.0 de máxima velocidad. Resistencia a impactos y durabilidad a largo plazo. Construido con los más altos estándares de exigencia",
        //         "stock": 23
        //     },
        //     {
        //         "title": "HD USB 5TB SEAGATE EXPANSION EXTERNO",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/hd-usb-5tb-seagate-expansion-externo-0.jpg",
        //         "price": 185040,
        //         "category": "discosrigidos",

        //         "description": "Características principales    -    Marca Seagate    -    Línea Expansion    -    Capacidad 5 TB    -    Color Negro    Otras características    -    Tecnología de almacenamiento HDD    -    Interfaces USB 3.0    -    Aplicaciones PC, Notebook    -    Ubicación del disco Externo    -    Tipo de disco externo Portátil    -    Factor de forma 2.5'    -    Sistemas de archivos soportados Windows / Mac",
        //         "stock": 12
        //     },
        //     {
        //         "title": "DISCO HDD 4TB SEAGATE IRONWOLF NAS",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/12/disco-hdd-4tb-seagate-ironwolf-nas-0.jpg",
        //         "price": 175219,
        //         "category": "discosrigidos",

        //         "description": "Optimización de disco duro de AgileArray para NAS.    -    IronWolf está optimizado con AgileArray, construido para NAS para proporcionar la experiencia NAS final. Cuenta con equilibrio de dos planos para un rendimiento consistente, firmware optimizado para RAID y administración avanzada de energía.    -    IronWolf Gestión de la Salud    -    IronWolf Health Management está diseñado para operar en NAS populares habilitadas, pobladas con soportados IronWolf o IronWolf Pro HDD. Ayuda a mejorar la fiabilidad general del sistema al mostrar automáticamente opciones de prevención, intervención y recuperación para el usuario.    -    Disco duro 4 TB        Otros detalles técnicos    -    Nombre de la marca Seagate    -    Serie ST4000VN008    -    Número de modelo del artículo ST4000VN008    -    Plataforma de hardware ordenador personal    -    Sistema operativo N / A    -    Peso del artículo 1,4 libras    -    Dimensiones del producto 5,8 x 4 x 1 pulgadas    -    Artículo Dimensiones L x A x H 5,79 x 4,01 x 1,03 pulgadas    -    Color 4TB    -    Velocidad de rotación de la unidad de disco duro 5900 RPM",
        //         "stock": 22
        //     },
        //     {
        //         "title": "VIDEO RADEON RX 6600 ASUS DUAL 8GB OC",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-radeon-rx-6600-asus-dual-8gb-oc-0.jpg",
        //         "price": 525720,
        //         "category": "placadevideo",

        //         "description": "Este componente electrónico procesa la información que llega al dispositivo y los transforma en imágenes o videos para mostrarla visualmente. Es ideal para trabajar con aplicaciones gráficas ya que permite obtener imágenes más nítidas. AMD es un fabricante estadounidense de placas de video, por su tecnología se ha destacado en crear procesadores de alta gama que permiten un excelente funcionamiento del motor gráfico de tu computadora. Velocidad en cada lectura Como cuenta con 2048 núcleos, los cálculos para el procesamiento de gráficos se realizarán de forma simultánea logrando un resultado óptimo del trabajo de la placa. Esto le permitirá ejecutar lecturas dispersas y rápidas de y hacia la GPU. Calidad de imagen: Criterio fundamental a la hora de elegir una placa de video, su resolución de 7680x4320 no te defraudará. La decodificación de los píxeles en tu pantalla te harán ver hasta los detalles más ínfimos en cada ilustración.",
        //         "stock": 23
        //     },
        //     {
        //         "title": "VIDEO GEFORCE RTX 3050 8GB ASUS DUAL OC",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-geforce-rtx-3050-8gb-asus-dual-oc-0.jpg",
        //         "price": 447026,
        //         "category": "placadevideo",

        //         "description": "Este componente electrónico procesa la información que llega al dispositivo y los transforma en imágenes o videos para mostrarla visualmente. Es ideal para trabajar con aplicaciones gráficas ya que permite obtener imágenes más nítidas. Nvidia es el fabricante líder de placas de video; su calidad asegura una experiencia positiva en el desarrollo del motor gráfico de tu computadora. Además, sus procesadores usan tecnología de punta para que puedas disfrutar de un producto veloz y duradero. Velocidad en cada lectura: Como cuenta con 2560 núcleos, los cálculos para el procesamiento de gráficos se realizarán de forma simultánea logrando un resultado óptimo del trabajo de la placa. Esto le permitirá ejecutar lecturas dispersas y rápidas de y hacia la GPU. Calidad de imagen: Criterio fundamental a la hora de elegir una placa de video, su resolución de 7680x4320 no te defraudará. La decodificación de los píxeles en tu pantalla te harán ver hasta los detalles más ínfimos en cada ilustración.",
        //         "stock": 25
        //     },
        //     {
        //         "title": "VIDEO RADEON RX 7600 8GB ASUS DUAL OC SIMIL 4060",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-radeon-rx-7600-8gb-asus-dual-oc-simil-4060-0.jpg",
        //         "price": 446625,
        //         "category": "placadevideo",

        //         "description": "ASUS Dual Radeon™ RX 7600 OC Edition 8GB GDDR6 optimizada por dentro y por fuera para temperaturas más bajas y durabilidad. Modo OC: Hasta 2745 MHz (Boost Clock)/hasta 2340 MHz (Game Clock). El diseño de ventilador Axial-tech cuenta con un centro de ventilador más pequeño para aumentar el flujo de aire a través de la matriz de refrigeración. Los baleros de ventilador de bolas dobles pueden durar hasta el doble que los diseños de baleros convencionales. El diseño de 2.5 ranuras permite una mayor compatibilidad de construcción al mismo tiempo que mantiene una refrigeración superior. La tecnología 0dB te permite disfrutar de juegos livianos en relativo silencio. Auto-extrema fabricación automatizada de precisión para una mayor confiabilidad. Un soporte de acero inoxidable es más duro y más resistente a la corrosión. El software GPU Tweak III proporciona ajustes de rendimiento intuitivos, controles térmicos y supervisión del sistema. 2 Ventiladoes. Doble diversión. Al ofrecer la última experiencia de arquitectura AMD RDNA™ 3 en su forma más pura, Dual Radeon™ RX 7600 combina rendimiento y simplicidad como ningún otro. Aprovechando las tecnologías de refrigeración avanzadas derivadas de las principales tarjetas gráficas, el Dual opta por la sustancia sobre el estilo, la elección perfecta para una construcción bien equilibrada. Abróchate el cinturón y disfruta de habilidades de juego de vanguardia. Ventiladores Axial-tech: Mejor, más rápido y más fuerte. Dos ventiladores Axial-tech de eficacia probada presentan un núcleo más pequeño que permite incorporar aspas más largas y un anillo de barrera para aumentar la presión de aire hacia abajo. Tecnología Auto-Extreme: Fabricación automatizada de precisión: La tecnología Auto-Extreme es un proceso de fabricación automatizado que establece nuevos estándares en la industria al permitir que toda la soldadura se complete en una sola pasada. Esto reduce la tensión térmica en los componentes y evita el uso de productos químicos de limpieza agresivos, lo que resulta en un menor impacto ambiental, un menor consumo de energía de fabricación y un producto más confiable en general. GPU TWEAK III: Monitorea, modifica y sintoniza. ASUS GPU Tweak III lleva los ajustes de las tarjetas gráficas al siguiente nivel. Permite establecer parámetros críticos como las velocidades de reloj de la GPU, la frecuencia de la memoria y la configuración del voltaje, con la opción de monitorizar todo en tiempo real mediante una pantalla personalizable. También incluye un control avanzado de los ventiladores y muchas otras funciones que te ayudarán a sacar el máximo partido a tu tarjeta gráfica. Elige tu fuente de poder: Utiliza nuestra calculadora de potencia para estimar cuánta energía necesitarás para alimentar tu equipo y luego elige una fuente de poder ROG Thor, ROG Loki o ROG Strix AURA compatible para obtener el máximo rendimiento.",
        //         "stock": 42
        //     },
        //     {
        //         "title": "VIDEO GEFORCE RTX 4060 8GB ASUS DUAL WHITE OC EDITION",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-geforce-rtx-4060-8gb-asus-dual-white-oc-edition-0.jpg",
        //         "price": 496338,
        //         "category": "placadevideo",

        //         "description": "ASUS Dual GeForce RTX™ 4060 White OC Edition 8GB GDDR6 con dos potentes ventiladores Axial-tech y un diseño de 2.5 ranuras para una amplia compatibilidad. Multiprocesadores de streaming NVIDIA Ada Lovelace: Hasta el doble de rendimiento y eficiencia energética. Tensor Cores de 4.ª generación: Hasta 4 veces más rendimiento con DLSS 3 que renderizado de fuerza bruta. RT Cores de tercera generación: Hasta el doble de rendimiento en ray tracing. OC Edition: 2535 MHz (OC Mode)/ 2505 MHz (Default Mode). El diseño del ventilador Axial-tech presenta un centro de ventilador más pequeño que facilita aspas más largas y un anillo de barrera que aumenta la presión del aire hacia abajo. Un diseño de 2.5 ranuras maximiza la compatibilidad y la eficiencia de refrigeración para un rendimiento superior en chasis pequeños. La tecnología 0dB te permite disfrutar de juegos livianos en relativo silencio. Los baleros de ventilador de bolas dobles pueden durar hasta el doble que los diseños de baleros tipo sleeve.",
        //         "stock": 12
        //     },
        //     {
        //         "title": "VIDEO GEFORCE RTX 4080 16GB GIGABYTE AERO OC EDITION",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-geforce-rtx-4080-16gb-gigabyte-aero-oc-edition-0.jpg",
        //         "price": 2235610,
        //         "category": "placadevideo",

        //         "description": "Este componente electrónico procesa la información que llega al dispositivo y los transforma en imágenes o videos para mostrarla visualmente. Es ideal para trabajar con aplicaciones gráficas ya que permite obtener imágenes más nítidas. Nvidia es el fabricante líder de placas de video; su calidad asegura una experiencia positiva en el desarrollo del motor gráfico de tu computadora. Además, sus procesadores usan tecnología de punta para que puedas disfrutar de un producto veloz y duradero. Velocidad en cada lectura: Cuenta con 9728 núcleos, por lo que la interfaz de la placa será algo sorprendente. Este tipo de estructura es apropiado para el procesamiento de tecnologías más complejas y modernas caracterizadas por grandes volúmenes de datos. Calidad de imagen: Criterio fundamental a la hora de elegir una placa de video, su resolución de 7680x4320 no te defraudará. La decodificación de los píxeles en tu pantalla te harán ver hasta los detalles más ínfimos en cada ilustración.",
        //         "stock": 34
        //     },
        //     {
        //         "title": "VIDEO GEFORCE RTX 3060 8GB GIGABYTE GAMING OC",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/3/video-geforce-rtx-3060-8gb-gigabyte-gaming-oc-0.jpg",
        //         "price": 394440,
        //         "category": "placadevideo",

        //         "description": "Graphics Processing GeForce RTX™ 3060, Core Clock 1807 MHz (Reference Card: 1777 MHz),    CUDA® Cores 3584, Memory Clock 15000 MHz, Memory Size 8GB, Memory Type GDDR6, Memory Bus 128 bit, Memory Bandwidth (GB/sec) 240 GB/s, Card Bus PCI-E 4.0, Digital max resolution 7680x4320, Multi-view 4, Card size L=198 W=121 H=39 mm, PCB Form ATX, DirectX 12 Ultimate, OpenGL 4.6, Recommended PSU 550W, Power Connectors 8 pin*1, Output DisplayPort 1.4a *2 / HDMI 2.1 *2",
        //         "stock": 23
        //     },
        //     {
        //         "title": "MONITOR GAMER 32'' LG 32GQ950-B IPS UHD 144HZ HDMI DP",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-32-lg-32gq950b-ips-uhd-144hz-hdmi-dp-0.jpg",
        //         "price": 2061190,
        //         "category": "monitor",

        //         "description": "LG busca entender a los usuarios para ofrecerles óptimas soluciones y nuevas experiencias a través de la evolución tecnológica. Disfrutá de la perfecta combinación de diseño, calidad y rendimiento que la empresa te ofrece en este monitor. Un monitor a tu medida: Gracias a su pantalla LCD vas a obtener gráficas con gran nitidez, colores vivos y atractivos. Una experiencia visual de calidad: Este monitor de 32' te va a resultar cómodo para estudiar, trabajar o ver una película en tus tiempos de ocio. Asimismo, su resolución de 3840 x 2160 te permite disfrutar de momentos únicos gracias a una imagen de alta fidelidad. Una de sus virtudes es que posee pantalla antirreflejo, de esta manera no verás reflejado lo que está detrás de vos y vas a evitar forzar tu vista para enfocar el contenido. Su tiempo de respuesta de un milisegundo lo hace ideal para gamers y cinéfilos porque es capaz de mostrar imágenes en movimiento sin halos o bordes borrosos.",
        //         "stock": 12
        //     },
        //     {
        //         "title": "MONITOR GAMER 27'' ASUS VG278Q 144HZ 1MS FHD HDMI DP",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-27-asus-vg278q-144hz-1ms-fhd-hdmi-dp-0.jpg",
        //         "price": 503520,
        //         "category": "monitor",

        //         "description": "Apasionada de la tecnología e impulsada por la innovación, Asus se esfuerza por crear una vida mejor para todas las personas. Siempre en búsqueda de nuevas ideas, la empresa aspira a ofrecer la más alta calidad en cada uno de sus productos. Comprobalo por vos mismo con este monitor Asus que te brindará una experiencia auténtica e increíble. Un monitor a tu medida: Con tu pantalla LED no solo ahorrás energía, ya que su consumo es bajo, sino que vas a ver colores nítidos y definidos en tus películas o series favoritas. Una experiencia visual de calidad: Este monitor de 27' te va a resultar cómodo para estudiar, trabajar o ver una película en tus tiempos de ocio. Asimismo, su resolución de 1920 x 1080 te permite disfrutar de momentos únicos gracias a una imagen de alta fidelidad.",
        //         "stock": 21
        //     },
        //     {
        //         "title": "MONITOR GAMER 24.5'' BENQ ZOWIE XL2546K DARK GREY 240HZ LED",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-245-benq-zowie-xl2546k-dark-grey-240hz-led-0.jpg",
        //         "price": 928320,
        //         "category": "monitor",

        //         "description": "MONITOR GAMER PARA E-SPORTS DE 24,5' BENQ ZOWIE XL2546K DE 2401HZ    XL2546K. BASE REDUCIDA: MÁS ESPACIO PARA JUGAR. Nueva base desarrollada para liberar más espacio al jugador sin perder la estabilidad, brindando mayor comodidad y flexibilidad durante el juego. AJUSTE FLEXIBLE: MÁS COMODIDAD DURANTE EL JUEGO. Con un ajuste de altura e inclinación libre, los jugadores pueden ajustarlo rápidamente según sus necesidades para un mejor resultado. ACCESO RÁPIDO A LA CONFIGURACIÓN: El cambio en la interfaz de usuario y el S-Switch es mucho más que estético. Fueron rediseñados con el objetivo de ofrecer la posibilidad de personalizar la configuración que prefieras para FPS, accediendo a ellos rápidamente. CONFIGURACIÓN COMPARTIDA DE XL-K: Comparte la configuración de tu monitor con tu equipo, tus amigos o seguidores. Guarda los perfiles de video rápidamente y compártelos desde la interfaz. TECNOLOGÍA DYAC™, UNA SENSACIÓN DE SPRAY DIFERENTE: DyAc™ ayuda a no perder el enfoque durante el spray. Permite a los jugadores ver las posiciones de los objetivos y los puntos de impacto con mayor claridad. REALIZA AJUSTES VISUALES SEGÚN LA NECESIDAD DEL JUEGO: Black eQualizer aumenta la visibilidad de las escenas oscuras, sin sobreexponer las áreas brillantes. Color Vibrance, por otro lado, ajusta la configuración y el tono de color para diferenciar los objetivos y enemigos en el juego y, finalmente, el modo de juego cambia entre las configuraciones previas del juego, de acuerdo con su título. NO COMPROMETE LA DURABILIDAD POR LA ESTÉTICA: El panel LCD está altamente protegido por un diseño enmarcado, que ofrece resistencia adicional en los bordes. Lo que es importante al transportar los monitores a eventos, por ejemplo. Con esto, podemos apreciar que la durabilidad prevalece en todo el proceso de diseño del producto. COMPATIBILIDAD: La nueva serie XL-K está diseñada para la mayor compatibilidad tanto con computadoras como con consolas de juego PS5 y Xbox Series X (a 120Hz).",
        //         "stock": 41
        //     },
        //     {
        //         "title": "MONITOR GAMER 27' ASUS TUF VG27AQ1A IPS 170HZ 2K 1MS DP HDMI",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-27-asus-tuf-vg27aq1a-ips-170hz-2k-1ms-dp-hdmi-0.jpg",
        //         "price": 730390,
        //         "category": "monitor",

        //         "description": "Sumérgete en una experiencia de juego inigualable con el monitor gamer Asus TUF Gaming VG27AQ1A de 27 pulgadas. Su pantalla LED WQHD de alta resolución (2560 x 1440 px) y relación de aspecto 16:9 te brindará imágenes nítidas y colores vibrantes para que no pierdas ningún detalle. Además, su frecuencia de actualización de 170 Hz y tiempo de respuesta GTG de 3 ms garantizan una fluidez y rapidez en tus partidas, evitando el desenfoque y el efecto fantasma. Este monitor cuenta con tecnologías Adaptive-Sync, FreeSync, FreeSync Premium y G-Sync, que aseguran una sincronización perfecta entre la tarjeta gráfica y el monitor, eliminando el tearing y el stuttering. Su panel IPS ofrece ángulos de visión horizontal y vertical de 178°, lo que te permitirá disfrutar de una imagen clara desde cualquier posición. El Asus TUF Gaming VG27AQ1A es giratorio y reclinable, lo que te brinda la posibilidad de ajustarlo a tu comodidad y preferencia. Además, su diseño antirreflejo te permitirá jugar sin distracciones, incluso en ambientes con mucha luz. Y si buscas una experiencia de sonido envolvente, este monitor cuenta con parlantes incorporados para que no necesites dispositivos externos. Gracias a su compatibilidad con montaje VESA, podrás colocarlo en la pared o en un soporte para optimizar tu espacio de juego. Además, es compatible con Windows 10, Windows 7 y Windows 8.1, lo que lo convierte en una opción versátil para cualquier configuración de PC. Con sus múltiples conexiones, como 2 HDMI 2.0, DisplayPort 1.2 y Jack 3.5 mm, podrás conectar fácilmente todos tus dispositivos y disfrutar de una experiencia de juego única. No esperes más para llevar tu experiencia gamer al siguiente nivel con el monitor Asus TUF Gaming VG27AQ1A.",
        //         "stock": 12
        //     },
        //     {
        //         "title": "MONITOR GAMER CURVO 27'' SAMSUNG ODYSSEY G5 WQHD 165HZ 1MS 2K",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-curvo-27-samsung-odyssey-g5-wqhd-165hz-1ms-2k-0.jpg",
        //         "price": 426648,
        //         "category": "monitor",

        //         "description": "- WQHD impresionante: tu mundo de juegos, ahora asombrosamente realista. Con 1,7 veces la densidad de píxeles de Full HD, la resolución WQHD ofrece imágenes increíblemente detalladas y nítidas. Experimenta una vista más completa con más espacio para disfrutar de toda la acción.- Preparado para conquistar enemigos, retrasar y difuminar. La tasa de refresco ultrarrápida de 165 Hz maneja incluso las escenas más emocionantes y las imágenes más rápidas. - Tiempo de respuesta de 1 ms: cada movimiento cuenta con un tiempo de respuesta de 1 ms. Su rendimiento en pantalla es tan rápido como tus propios reflejos. Actúa sobre tus enemigos, tan pronto los veas.- AMD FreeSync Premium: juega fluidamente y sin esfuerzo. AMD FreeSync Premium cuenta con tecnología de sincronización adaptativa que reduce el tearing, el stuttering y la latencia de entrada.- HDR realista: gráficos impresionantes con HDR10. Un espectro de sombras da vida a las escenas del juego de una manera más vibrante. Explora los secretos ocultos en las sombras con negros más oscuros, blancos más luminosos y una resolución extraordinariamente detallada.",
        //         "stock": 11
        //     },
        //     {
        //         "title": "MONITOR GAMER 27'' SAMSUNG ODYSSEY G4 FHD 240HZ DP HDMI",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/18/monitor-gamer-27-samsung-odyssey-g4-fhd-240hz-dp-hdmi-0.jpg",
        //         "price": 392204,
        //         "category": "monitor",

        //         "description": "Resolución FHD | Panel IPS: Experimenta tus juegos con una calidad visual excepcional. El panel IPS ofrece colores vivos y un amplio ángulo de visión de 178º, asegurando claridad desde cualquier perspectiva. Tasa de refresco de 240Hz y 1ms de tiempo de respuesta: Disfruta de escenas fluidas y sin retardo. La alta tasa de refresco proporciona una experiencia de juego dinámica, mientras que el tiempo de respuesta de 1ms mantiene la acción nítida y sin desenfoques. Soporte ergonómico: Ajusta el monitor a tu preferencia. Gira, inclina y modifica la altura para una experiencia de juego confortable y personalizada.",
        //         "stock": 11
        //     },
        //     {
        //         "title": "AURICULAR C/MICROFONO LOGITECH G335 MINT 981-001023",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-cmicrofono-logitech-g335-mint-981001023-0.jpg",
        //         "price": 74900,
        //         "category": "auriculares",

        //         "description": "Sumérgete en el mundo de los videojuegos con los auriculares gamer Logitech G Series G335 en color mint. Diseñados para brindarte una experiencia de audio inmersiva, estos auriculares over-ear cuentan con unidades de diafragma de 40 mm que ofrecen un sonido nítido y potente. Con una impedancia de 36 Ω y una respuesta en frecuencia de 20 Hz a 20 kHz, disfrutarás de un audio de alta calidad en tus juegos favoritos. El micrófono incorporado te permite comunicarte con tus amigos y compañeros de equipo de manera clara y efectiva, mejorando la colaboración y la estrategia en el juego. Además, los auriculares G335 son compatibles con PlayStation, Xbox y Nintendo Switch, lo que los convierte en una opción versátil para todos los gamers. A pesar de no ser inalámbricos, estos auriculares cuentan con un conector Jack de 3.5 mm que garantiza una conexión estable y sin interrupciones. Además, se incluye un divisor en Y para que puedas conectarlos fácilmente a tus dispositivos. Los auriculares Logitech G Series G335 no solo ofrecen un rendimiento excepcional, sino que también cuentan con un diseño cómodo y elegante. Su color mint le da un toque de estilo único, mientras que su formato over-ear garantiza horas de comodidad durante tus sesiones de juego. No esperes más para disfrutar de la mejor experiencia de audio en tus videojuegos con los auriculares gamer Logitech G335.",
        //         "stock": 7
        //     },
        //     {
        //         "title": "AURICULAR C/MIC WIRELESS LOGITECH G735 WHITE 981-001082",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-cmic-wireless-logitech-g735-white-981001082-0.jpg",
        //         "price": 289800,
        //         "category": "auriculares",

        //         "description": "¡Experimenta la adrenalina de sumergirte en la escena de otra manera! Tener auriculares específicos para jugar cambia completamente tu experiencia en cada partida. Con los Logitech G735 no te pierdes ningún detalle y escuchas el audio tal y como fue diseñado por los creadores.",
        //         "stock": 9
        //     },
        //     {
        //         "title": "AURICULAR LOGITECH G733 WIRELESS LIGHTSPEED RGB WHITE 981-000882",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-logitech-g733-wireless-lightspeed-rgb-white-981000882-0.jpg",
        //         "price": 268940,
        //         "category": "auriculares",

        //         "description": "¡Experimentá la adrenalina de sumergirte en la escena de otra manera! Tener auriculares específicos para jugar cambia completamente tu experiencia en cada partida. Con los Logitech G733 no te perdés ningún detalle y escuchás el audio tal y como fue diseñado por los creadores. El formato perfecto para vos: El diseño over-ear brinda una comodidad insuperable gracias a sus suaves almohadillas. Al mismo tiempo, su sonido envolvente del más alto nivel se convierte en el protagonista de la escena.",
        //         "stock": 10
        //     },
        //     {
        //         "title": "AURICULAR C/MIC LOGITECH G PRO GAMING 981-000811",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-cmic-logitech-g-pro-gaming-981000811-0.jpg",
        //         "price": 179380,
        //         "category": "auriculares",

        //         "description": "Sumérgete en el mundo de los videojuegos con los auriculares gamer inalámbricos Logitech Pro X Wireless en color negro. Diseñados especialmente para los amantes de los juegos, estos auriculares over-ear te permiten disfrutar de una experiencia de audio inmersiva y libre de cables gracias a su alcance inalámbrico de 15 metros. Con una duración de batería de hasta 20 horas, podrás jugar durante largas sesiones sin preocuparte por recargarlos. Además, el micrófono incorporado te permitirá comunicarte con tus compañeros de equipo de manera clara y nítida. Aunque no cuentan con cancelación de ruido ni resistencia al agua, los auriculares Logitech Pro X Wireless son la opción perfecta para aquellos que buscan comodidad y rendimiento en sus sesiones de juego.",
        //         "stock": 14
        //     },
        //     {
        //         "title": "AURICULAR GAMER RAZER BARRACUDA X NEW BLACK",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-gamer-razer-barracuda-x-new-black-0.jpg",
        //         "price": 191060,
        //         "category": "auriculares",

        //         "description": "Sumérgete en el mundo de los videojuegos con los auriculares gamer Razer Barracuda X en color negro. Diseñados especialmente para los amantes de los juegos, estos auriculares over-ear te ofrecen una experiencia de audio inmersiva y de alta calidad. Con su micrófono incorporado, podrás comunicarte con tus compañeros de equipo de manera clara y nítida. Además, su función de cancelación de ruido te permitirá concentrarte en la partida sin distracciones externas. Los auriculares Razer Barracuda X son inalámbricos, lo que te brinda mayor libertad de movimiento durante tus sesiones de juego. A pesar de no contar con Bluetooth, su compatibilidad con consolas como PlayStation, Nintendo Switch y Xbox asegura que puedas disfrutar de tus juegos favoritos en diferentes plataformas. Su unidad de diafragma de 40 mm, impedancia de 32 Ω y respuesta en frecuencia de 20 Hz a 20 kHz garantizan un sonido potente y equilibrado. Con una duración de batería de hasta 20 horas, podrás jugar durante largas sesiones sin preocuparte por la carga. Además, su modo manos libres te permitirá atender llamadas sin interrumpir tu partida. Los auriculares Razer Barracuda X cuentan con un conector Jack 3.5 mm, lo que los hace versátiles y compatibles con una amplia variedad de dispositivos. No esperes más para mejorar tu experiencia de juego con estos auriculares Razer Barracuda X. ¡Adquiérelos ahora y disfruta de un sonido envolvente y una comodidad inigualable!",
        //         "stock": 55
        //     },
        //     {
        //         "title": "AURICULAR CORSAIR HS55 GAMING STEREO CARBON",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/28/auricular-corsair-hs55-gaming-stereo-carbon-0.jpg",
        //         "price": 68200,
        //         "category": "auriculares",

        //         "description": "Los auriculares para juegos CORSAIR HS55 STEREO ofrecen una comodidad y una calidad del sonido esenciales durante todo el día gracias a las almohadillas de espuma viscoelástica y polipiel, el diseño ligero y los controladores de audio de neodimio de 50 mm ajustados a medida.",
        //         "stock": 23
        //     },
        //     {
        //         "title": "Mouse Logitech G Pro",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/910-005536_800.jpg",
        //         "price": 56484,
        //         "category": "mouses",

        //         "description": "Sumérgete en el mundo de los videojuegos con el mouse gamer Logitech Pro Series G Pro Hero en color negro. Diseñado especialmente para gamers, este mouse cuenta con un sensor óptico Hero 25K de alta precisión que te permitirá apuntar y moverte con total fluidez y exactitud. Con sus 25600 dpi de resolución, no habrá enemigo que se te escape. Además, sus 6 botones te brindarán un control total y personalizable para que puedas adaptarlo a tus necesidades y estilo de juego. El cable de 2.1 metros de largo te proporcionará la libertad de movimiento que necesitas para disfrutar de tus partidas sin restricciones. Y por si fuera poco, la rueda de desplazamiento te permitirá navegar por tus menús y opciones de manera rápida y cómoda. No esperes más y lleva tu experiencia gamer al siguiente nivel con el mouse Logitech G Pro Hero.",
        //         "stock": 67
        //     },
        //     {
        //         "title": "Mouse Logitech G305 Lightspeed Inalambrico",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/910-005281_800.jpg",
        //         "price": 57807,
        //         "category": "mouses",

        //         "description": "Para trabajar desde casa con la computadora o aprovechar los momentos de ocio, necesitás comodidad y facilidad de movimiento. Con tu Logitech G Lightspeed encontrá eso que buscás en un solo aparato con la mejor tecnología. Adaptado a tus movimientos: Su diseño eficaz hace de este mouse un elemento cómodo, con una gran experiencia de uso para aquellas personas que buscan seguridad en cada click. La funcionalidad al alcance de tu mano: El sistema de detección de movimiento óptico te permitirá mover el cursor de una manera más precisa y sensible que en los sistemas tradicionales. Plug And Play: Solo debés colocar el receptor en un puerto USB de la computadora y ya podés empezar a usarlo. No hace falta emparejar el mouse ni descargar software para utilizarlo. Tecnología inalámbrica: Trabajá de forma inalámbrica y movete libremente sin ninguna interrupción. Al no haber cables, tu escritorio se mantiene despejado. Y además, podés llevar tu mouse fácilmente de un espacio de trabajo a otro. Apto para fácil traslado: Navegá rápidamente por documentos y páginas web gracias su diseño ultra delgado, ergonómico, liviano y conveniente para llevar a donde quieras o viajar.",
        //         "stock": 54
        //     },
        //     {
        //         "title": "Mouse Logitech G502 HERO",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/910-005550_800.jpg",
        //         "price": 87246,
        //         "category": "mouses",

        //         "description": "Sumérgete en el mundo de los videojuegos con el mouse gamer Logitech G Series Hero G502 en color negro. Diseñado especialmente para gamers, este mouse cuenta con un sensor óptico Hero 25K de alta precisión que te permitirá apuntar y moverte con total fluidez en tus partidas. Además, su resolución de 25600 dpi garantiza un control excepcional en cada movimiento. El Logitech G502 cuenta con 11 botones programables, lo que te permitirá personalizar tus acciones y tener un acceso rápido a tus habilidades y comandos favoritos. Su conexión USB asegura una rápida respuesta y un rendimiento óptimo en todo momento. Gracias a su rueda de desplazamiento, podrás navegar por tus menús y páginas web con facilidad, mientras que su diseño ergonómico y con cable te brindará comodidad durante largas sesiones de juego. No esperes más para mejorar tu experiencia gamer con el mouse Logitech G Series Hero G502.",
        //         "stock": 65
        //     },
        //     {
        //         "title": "Mouse Redragon M808-KS Storm Pro",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/6950376781277_800.jpg",
        //         "price": 45574,
        //         "category": "mouses",

        //         "description": "Con más de 20 años de experiencia en fabricación de productos, Redragon innova día a día en diseño y calidad. Su objetivo es producir equipamiento de alta gama para jugadores, con excelentes prestaciones y a un precio accesible. Los mouses Redragon son adecuados para todas las ocasiones, ya sea para entretenerse en el hogar o usarlo en el trabajo. Experimentá el diseño cómodo y elegante de este dispositivo. Adaptado a tus movimientos: El mouse de juego te ofrecerá la posibilidad de marcar la diferencia y sacar ventajas en tus partidas. Su conectividad y sensor suave ayudará a que te desplaces rápido por la pantalla. La funcionalidad al alcance de tu mano: El sistema de detección de movimiento óptico te permitirá mover el cursor de una manera más precisa y sensible que en los sistemas tradicionales. Plug And Play: Solo debés colocar el receptor en un puerto USB de la computadora y ya podés empezar a usarlo. No hace falta emparejar el mouse ni descargar software para utilizarlo. Mayor duración de la batería: Con batería recargable incorporada que podés cargar fácilmente con el cable USB incluido sin necesidad de reemplazarla. Para prolongar la duración, usá el conmutador de encendido para apagar el mouse cuando no lo estés usando. Apto para fácil traslado: Navegá rápidamente por documentos y páginas web gracias su diseño ultra delgado, ergonómico, liviano y conveniente para llevar a donde quieras o viajar.",
        //         "stock": 12
        //     },
        //     {
        //         "title": "Mouse Logitech G705 Aurora White Gaming Wireless",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/910-006366_800.jpg",
        //         "price": 98787,
        //         "category": "mouses",

        //         "description": "Logitech diseña productos y experiencias que ocupan un lugar cotidiano en la vida de las personas, poniendo foco en la innovación y la calidad. Su objetivo es crear momentos verdaderamente únicos y significativos para sus usuarios. Los mouses Logitech se adaptan a la forma de tu mano para proporcionarte horas de comodidad. Sin necesidad de mover el brazo para deslizar el cursor, tu mano se fatigará menos. Son ideales para cualquier espacio de trabajo y quienes tienen la mesa llena de diversos objetos. • ADAPTADO A TUS MOVIMIENTOS: El mouse de juego te ofrecerá la posibilidad de marcar la diferencia y sacar ventajas en tus partidas. Su conectividad y sensor suave ayudará a que te desplaces rápido por la pantalla. • LA FUNCIONALIDAD AL ALCANCE DE TU MANO: El sistema de detección de movimiento óptico te permitirá mover el cursor de una manera más precisa y sensible que en los sistemas tradicionales. • PLUG AND PLAY: Solo debes colocar el receptor en un puerto USB de la computadora y ya puedes empezar a usarlo. No hace falta emparejar el mouse ni descargar software para utilizarlo. • CONEXIÓN EN CUESTIÓN DE SEGUNDOS: Gracias a su tecnología Bluetooth tendrás la libertad para crear cuando quieras, donde quieras, en la computadora que elijas, con toda comodidad. • APTO PARA FÁCIL TRASLADO: Navega rápidamente por documentos y páginas web gracias su diseño ultra delgado, ergonómico, liviano y conveniente para llevar a donde quieras o viajar.",
        //         "stock": 21
        //     },
        //     {
        //         "title": "Mouse Logitech G604 Gaming Lightspeed Wireless Black",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/910-005648_800.jpg",
        //         "price": 151104,
        //         "category": "mouses",

        //         "description": "El mejor aliado para lo que necesites. Usá tu Logitech Lightspeed G Series en la oficina, en tu casa o donde quieras y navegá en tus dispositivos sin límites. A un click de distancia: El mouse de juego te ofrecerá la posibilidad de marcar la diferencia y sacar ventajas en tus partidas. Su conectividad y sensor suave ayudará a que te desplaces rápido por la pantalla. Además, su sistema de detección de movimiento óptico te permitirá mover el cursor de una manera más precisa y sensible que en los sistemas tradicionales. Con sus 15 botones podrás tener mayor control e independencia para ejecutar.",
        //         "stock": 31
        //     },
        //     {
        //         "title": "Micro Intel I7-13700 5.20Ghz 24Mb S.1700",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/BX8071513700_800.jpg",
        //         "price": 748000,
        //         "category": "procesadores",

        //         "description": "Modelo  Core I7 13700    -    Familia   INTEL    -    Nucleos   16    -    Hilos    24   -   Frecuencia Max.    Hasta 5.2 GHz    -    Proceso De Fabricacion    No Especifica    -    Grafica Integrada UHD Graphics 770    -    SocketLGA 1700",
        //         "stock": 13
        //     },
        //     {
        //         "title": "Micro Intel I9-12900 5.1Ghz 30Mb S.1700",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/BX8071512900_800.jpg",
        //         "price": 782665,
        //         "category": "procesadores",

        //         "description": "Modelo  Core I9 12900    -    Familia   Intel    -    Nucleos   16    -    Hilos    24      -  Frecuencia Max.  Hasta 5.GHz    -    Proceso De Fabricacion  10 Nm SuperFin>    -    Grafica Integrada   Intel UHD Graphics 770    -    Socket   LGA 1700",
        //         "stock": 52
        //     },
        //     {
        //         "title": "Micro Intel I3-13100 4.5Ghz 12Mb S.1700",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/BX8071513100_800.jpg",
        //         "price": 241065,
        //         "category": "procesadores",

        //         "description": "Modelo  Core I3-13100     -   Familia Intel    -    Nucleos 4    -    Hilos   8    -    Frecuencia Max. Hasta 4.50 GHz    -    Proceso De Fabricacion  10 Nm    -    Grafica Integrada   Gráficos UHD Intel® 730    -    Socket  LGA 1700",
        //         "stock": 24
        //     },
        //     {
        //         "title": "Micro Intel I7-10700 4.8Ghz 16Mb S.1200",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/5032037188722_800.jpg",
        //         "price": 354000,
        //         "category": "procesadores",

        //         "description": "Modelo  Micro Intel I7-10700 4.8 GHz    -    Familia Intel I7    -    Nucleos 8    -    Hilos   16     -   Frecuencia  2.9 GHz    -    Frecuencia Turbo    4.8 GHz    -    Proceso De Fabricacion  14 Nm    -    Grafica Integrada   UHD 630    -    Socket  LGA1200",
        //         "stock": 26
        //     },
        //     {
        //         "title": "Micro AMD Ryzen 5 7600 5.1 Ghz AM5",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/100-100001015BOX_800.jpg",
        //         "price": 283116,
        //         "category": "procesadores",

        //         "description": "Modelo  RYZEN 5 7600    -    Familia AMD    -    Nucleos 6    -    Hilos   12    -    Frecuencia Max. Hasta 5.1 GHz    -    Proceso De Fabricacion  5 NM    -    Grafica Integrada   RADEON GRAPHICS    -    Socket  AM5",
        //         "stock": 36
        //     },
        //     {
        //         "title": "Micro AMD Ryzen 9 7950X 5.7 Ghz AM5",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/100-100000514WOF_800.jpg",
        //         "price": 944590,
        //         "category": "procesadores",

        //         "description": "Modelo  Ryzen 9 7950x     -   Familia AMD    -    Nucleos 16    -    Hilos   32    -    Frecuencia Max. Hasta 5.7 GHz    -    Proceso De Fabricacion  5 Nm    -    Grafica Integrada   Gráficos Radeon    -    Socket  AM5",
        //         "stock": 18
        //     },
        //     {
        //         "title": "Memoria Hikvision DDR4 16GB 2666MHz CL19 SODIMM",
        //         "thumbnail": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_35708_Memoria_Hikvision_DDR4_16GB_2666MHz_CL19_SODIMM_af6fac09-grn.jpg",
        //         "price": 49000,
        //         "category": "memoriasram",

        //         "description": "Capacidad        16 gb    -    Velocidad        2666 mhz    -    Tipo        DDR4    -    Cantidad De Memorias        1    -    Latencia        19 cl    -    Voltaje    1.20V",
        //         "stock": 22
        //     },
        //     {
        //         "title": "Memoria Ram Sodimm Neo Forza 4GB 2666 Mhz DDR4 BULK",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/NMSO440D85-2666EA00_800.jpg",
        //         "price": 18155,
        //         "category": "memoriasram",

        //         "description": "Familia Neo Forza    -    Tipo De Memoria DDR4    -    Tamaño De Memoria   4 GB    -    Formato De Memoria  SODIMM    -    Latencia CAS    CL19     -     Voltaje 1.35 V    -    Velocidad   2666 MHz",
        //         "stock": 41
        //     },
        //     {
        //         "title": "Memoria Adata DDR4 8GB 3200MHz XPG Spectrix D60G RGB Titanium",
        //         "thumbnail": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_28924_Memoria_Adata_DDR4_8GB_3200MHz_XPG_Spectrix_D60G_RGB_Titanium_88f51e0f-grn.jpg",
        //         "price": 36310,
        //         "category": "memoriasram",

        //         "description": "Capacidad        8 gb     -   Velocidad        3200 mhz    -    Tipo        DDR4    -    Cantidad De Memorias        1    -    Latencia        16 cl     -    Voltaje        1.35 v",
        //         "stock": 15
        //     },
        //     {
        //         "title": "Memoria Ram Netac Shadow RGB 8GB 3200 Mhz DDR4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/NTSRD4P32SP-08E_800.jpg",
        //         "price": 34800,
        //         "category": "memoriasram",

        //         "description": "Familia NETAC    -    Tipo De Memoria DDR4    -    Tamaño De Memoria   8 GB    -    Formato De Memoria  UDIMM    -    Latencia CAS    CAS 16    -    Voltaje 1.35 V    -    Velocidad   3200 MHz",
        //         "stock": 17
        //     },
        //     {
        //         "title": "Memoria Ram Corsair Vengeance RGB RS 8GB 3200 Mhz DDR4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/CMG8GX4M1E3200C16_800.jpg",
        //         "price": 35475,
        //         "category": "memoriasram",

        //         "description": "Familia CORSAIR    -    Tipo De Memoria DDR4    -    Tamaño De Memoria 8 GB    -    Formato De Memoria Dimm    -    Latencia CAS 16-20-20-38    -    Voltaje 1.35    -    Velocidad 3200 MHz",
        //         "stock": 20
        //     },
        //     {
        //         "title": "Memoria Ram PNY XLR8 GAMING 8GB 3600Mhz RGB DDR4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/MD8GD4360016XRGB_800.jpg",
        //         "price": 39590,
        //         "category": "memoriasram",

        //         "description": "Familia PNY    -    Tipo De Memoria DDR4    -    Tamaño De Memoria 8 GB   -    Formato De Memoria Dimm    -    Latencia CAS CL18    -    Voltaje 1.35V    -    Velocidad 3600 MHz",
        //         "stock": 20
        //     },
        //     {
        //         "title": "Disco Solido SSD 240GB Western Digital Green SATA III",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/WesternDigitalS240G2G0A_800.jpg",
        //         "price": 29718,
        //         "category": "ssd",

        //         "description": "Capacidad 240 GB    -    Dimensiones 100.5mm X 69.85mm X 7.0 Mm    -    Conector SATA III 6Gbps    -    Vida Util Hasta 1 Millon De Horas",
        //         "stock": 20
        //     },
        //     {
        //         "title": "Disco Solido SSD 500GB Western Digital SN570 Blue M.2 NVMe PCIe x4 3.0",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/WDS250G3B0C_800.jpg",
        //         "price": 32628,
        //         "category": "ssd",

        //         "description": "Capacidad 500 GB    -    Dimensiones 80.01 X 3.81 X 22.1 Mm    -    Conector PCIe Gen3 X4 NVMe V1.4    -    Vida Util 1.5 Millones De Hs.",
        //         "stock": 23
        //     },
        //     {
        //         "title": "Disco Solido SSD 240GB Western Digital SN350 Green M.2 NVMe PCIe X4 3.0",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/WDS240G2G0C_800.jpg",
        //         "price": 31119,
        //         "category": "ssd",

        //         "description": "Tipo De Conexión        M2    -    Dimensiones 80 Mm X 22 Mm X 2.28 Mm    -    Conector PCIe X4 3.0    -    Vida Util 1.000.000 Millones De Horas",
        //         "stock": 24
        //     },
        //     {
        //         "title": "Disco Solido SSD 500GB Western Digital SN750SE Black M.2 NVMe PCIe x4 4.0",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/WDS500G1B0E_800.jpg",
        //         "price": 71605,
        //         "category": "ssd",

        //         "description": "Capacidad 500 GB    -    Dimensiones 80 Mm X 22 Mm X 2.38 Mm    -    Conector PCIe X4 4.0    -    Vida Util 1.750.000 Hs",
        //         "stock": 26
        //     },
        //     {
        //         "title": "Disco Solido SSD 512GB Patriot P400 M.2 PCIe X4 4.0",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/P400P512GM28_800.jpg",
        //         "price": 63468,
        //         "category": "ssd",

        //         "description": "Capacidad   512 GB    -    Dimensiones 8 Cm X 2.2 Cm X 0.38 Cm    -    Conector    M.2 PCIe X4    -    Vida Util   No Especifica",
        //         "stock": 21
        //     },
        //     {
        //         "title": "Disco Solido SSD 2TB Patriot P400 LITE M.2 PCIe X4 4.0",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/P400LP2KGM28H_800.jpg",
        //         "price": 189398,
        //         "category": "ssd",

        //         "description": "Capacidad 2 TB    -    Dimensiones 8 Cm X 2.2 Cm X 0.38 Cm    -    Conector M.2 PCIe X4    -    Vida Util No Especifica",
        //         "stock": 36
        //     },
        //     {
        //         "title": "Motherboard Asus A320M K Prime AM4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/90MB0TV0-M0AAY0_800.jpg",
        //         "price": 93864,
        //         "category": "mother",

        //         "description": "General    -    Socket AM4    -    Chipset A320    -    Plataforma AMD                      Conectividad    -    Salidas HDMI 1    -    Salidas D-Sub 1    -    Puertos SATA 4    -    Slot M2 1 (Soporta NVMe Y SATA)    -    Slot PCI-E 16X 1    -    Slot PCIE-E 1X 2    -    Puerto PS/2 2    -    Placa De Red Realtek® RTL8111H    -    USB 4 (3.1) / 2 (2.0)                                                                    Dimensiones    -    Factor MATX                                                                              Energia    -    Conector 24 Pines 1    -    Conector CPU 4 Pines 1                                              Memoria    -    Cantidad De Slot DDR4 DIMM 2 (Max 32GB)                                                         Sonido    -    Sonido Realtek® ALC887 8-Channel High Definition Audio CODEC",
        //         "stock": 19
        //     },
        //     {
        //         "title": "Motherboard Gigabyte H470M H 1200 DDR4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/H470M-H_800.jpg",
        //         "price": 101870,
        //         "category": "mother",

        //         "description": "General    -    Socket  1200    -    Chipset  H470    -    Plataforma  Intel        Conectividad        Salidas HDMI  SI    -    Salidas VGA  Si    -    Salidas DisplayPort  NO    -    Salidas VI-D  No    -    Puertos SATA  4    -    Slot M2  2    -    Slot PCI-E 16X  1    -    Slot PCI-E 4X  1    -    Puerto PS/2  2    -    Placa De Red  Realtek® GbE LAN Chip    -    WiFi  NO    -    USB  4        Dimensiones    -    Factor  Micro ATX        Energia    -    Conector 24 Pines  1    -    Conector CPU 8 Pines  1        Memoria    -    Cantidad De Slot DDR4 DIMM  2 (Max. 32GB)",
        //         "stock": 18
        //     },
        //     {
        //         "title": "KIT Intel Celeron J4005 - Motherboard Asus Prime J4005I-C DDR4",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/90mb0w90-m0eay1_800.jpg",
        //         "price": 133829,
        //         "category": "mother",

        //         "description": "General    -    Socket Procesador Integrado    -    Chipset J4005i-C    -    Plataforma INTEL        Conectividad    -    Salidas HDMI SI    -    Salidas VGA SI    -    Salidas DisplayPort No    -    Salidas DVI-D No    -    Puertos SATA 2    -    Slot M2 1    -    Slot PCI-E 16X 1    -    Slot PCI-E 4XS i    -    Puerto PS/2 2    -    Placa De Red Realtek LAN Chip    -    WiFi NO    -    USB 4        Dimensiones    -    Factor MATX        Energia    -    Conector 24 Pines 1    -    Conector CPU 8 Pines 1        Memoria    -    Cantidad De Slot DDR4 DIMM 2 (Max. 8GB)",
        //         "stock": 19
        //     },
        //     {
        //         "title": "Motherboard Asus Tuf Gaming B560M Plus Wifi 1200",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/90MB1770M0EAY0_800.jpg",
        //         "price": 203680,
        //         "category": "mother",

        //         "description": "General    -    Socket 1200    -    Chipset B560    -    Plataforma Intel        Conectividad    -    Salidas HDMI 1    -    Salidas VGA No    -    Salidas DisplayPort 1    -    Salidas DVI-D No    -    Puertos SATA 6    -    Slot M2 2 (1 Soporta Sata Y NVMe, 1 Soporta NVMe)    -    Slot PCI-E 16X 1    -    Slot PCIE-E 1X 2    -    Puerto PS/2 1    -    Placa De Red Realtek RTL8125B 2.5Gb Ethernet    -    WiFi Intel® Wi-Fi 6    -    USB 4 X USB 2.0 Port, 2 X USB 3.2 Gen 1, 2 X USB 3.2 Gen 2 ,1 X USB 3.2 Gen 1 Type C        Dimensiones    -    Factor M-ATX        Energia    -    Conector 24 Pines 1    -    Conector CPU 8 Pines 1        Memoria    -    Cantidad De Slot DDR4 DIMM 4 (Max. 128 GB)        Sonido    -    Sonido Realtek ALC887/897",
        //         "stock": 18
        //     },
        //     {
        //         "title": "Motherboard Asus B650M-A II Prime AM5",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/B650M-A%20II-CSM_800.jpg",
        //         "price": 247682,
        //         "category": "mother",

        //         "description": "General    -    Socket AM5    -    Chipset B650    -    Plataforma AMD        Conectividad    -    Salidas HDMI SI    -    Salidas VGA NO    -    Salidas DisplayPort SI    -    Salidas DVI-D No    -    Puertos SATA 4    -    Slot M2 2    -    Slot PCI-E 16X 3    -    Slot PCI-E 4X Si    -    Puerto PS/2 2    -    Placa De Red Realtek LAN Chip    -    WiFi NO    -    USB 2x3.2 Gen1 / 4x2.0 / 2x3.2 Gen2        Dimensiones    -    Factor MATX        Energia    -    Conector 24 Pines 1    -    Conector CPU 8 Pines 1        Memoria    -    Cantidad De Slot DDR5 DIMM 4 (Max. 128GB)",
        //         "stock": 16
        //     },
        //     {
        //         "title": "Motherboard Asus Rog Strix Z790-A Gaming Wifi DDR4 S1700",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/90mb1cn0-m0eay0_800.jpg",
        //         "price": 484996,
        //         "category": "mother",

        //         "description": "General    -    Socket LGA 1700    -    Chipset Z790    -    Plataforma INTEL        Conectividad    -    Salidas HDMI SI    -    Salidas VGA SI    -    Salidas DisplayPort SI    -    Salidas DVI-D No    -    Puertos SATA 2    -    Slot M2 3    -    Slot PCI-E 16X 1    -    Slot PCI-E 4X Si    -    Puerto PS/2 2    -    Placa De Red Realtek LAN Chip    -    WiFi NO    -    USB 6        Dimensiones    -    Factor MATX        Energia    -    Conector 24 Pines 1    -    Conector CPU 8 Pines 1        Memoria    -    Cantidad De Slot DDR4 DIMM 4 (Max. 128GB)",
        //         "stock": 15
        //     },
        //     {
        //         "title": "Teclado Mecanico Genesis THOR 300 TKL RGB Español Switch Red",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/NKG-1598_800.jpg",
        //         "price": 50537,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor MECANICO    -    Altura Del Producto 134 Mm    -    Ancho Del Producto 355 Mm    -    Profundidad 38 Mm    -    Peso 695 G        Conectividad    -    Tipo De Conexion Cable    -    Largo Del Cable 1.75 M    -    Tipo De Conexion USB    -    Caracteristicas    -    Estilo: Tenkeyless ESPAÑOL        Iluminacion    -    Retroiluminado SI    -    Teclas Iluminadas RGB    -    Tipo De Iluminacion SI        Teclas    -    Vida De La Tecla 50 Millones De Pulsaciones    -    Anti-Ghosting SI    -    Distancia De Recorrido Outemu    -    Tipo De Interruptor 2 Mm    -    Fuerza De Activacion 45 G        Compatibilidad    -    Tipos De Dispositivos Compatibles Laptop, Pc    -    Plataformas De Software Compatibles Windows XP, Windows Vista, Windows 8, Windows 7, Windows 10, Linux, Android 4.2.2",
        //         "stock": 15
        //     },
        //     {
        //         "title": "Teclado Kingston HyperX Alloy Origins 60 RGB Mecanico Gaming Switch RED",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/HKBO1S-RB-US--G_800.jpg",
        //         "price": 96263,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor Mecanico    -    Altura Del Producto 36.9 Mm    -    Ancho Del Producto 296 Mm    -    Profundidad Del Producto 150.5 Mm    -    Peso Total 781,5 G        Conectividad    -    Tipo De Conexion Cableado    -    Largo Del Cable 1.8 M        Caracteristicas    -    Layout Ingles        Iluminacion        Retroiluminado Si    -    Colores De La Retroiluminacion RGB    -    Teclas Iluminadas Si        Teclas    -    Vida De La Tecla 80 Millones (Pulsaciones)    -    Anti-Ghosting Si    -    Marca Del Interruptor No Especifica    -    Distancia De Recorrido 3,8 Mm    -    Tipo De Interruptor HyperX Red    -    Fuerza De Activacion 45 G        Compatibilidad    -    Tipos De Dispositivos Compatibles Pc, Laptop    -    Plataformas De Software Compatibles Windows® 10, 8.1, 8, 7",
        //         "stock": 11
        //     },
        //     {
        //         "title": "Teclado Logitech K120 Usb",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/920-004422_800.jpg",
        //         "price": 13911,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor Membrana    -    Altura Del Producto 155 Mm    -    Ancho Del Producto 450 Mm    -    Profundidad Del Producto 24 Mm    -    Peso Total 730 G        Conectividad    -    Tipo De Conexion Cableada    -    Largo Del Cable Sin Especificar    -    Tipo De Conector USB        Compatibilidad    -    Tipo De Dispositivos Compatibles PC, Laptop    -    Plataformas De Software Compatibles Windows 8 / Windows 7 / Vista / XP",
        //         "stock": 13
        //     },
        //     {
        //         "title": "Teclado Mecanico Genesis THOR 100 Keypad RGB",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/NKG-1319_800.jpg",
        //         "price": 20215,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor Mecanico    -    Altura Del Producto 178 Mm    -    Ancho Del Producto 231 Mm    -    Profundidad Del Producto 36 Mm    -    Peso Total 385 G        Conectividad    -    Tipo De Conexion Cableado    -    Largo Del Cable 1.8 M    -    Tipo De Conector USB        Caracteristicas    -    Caracteristicas Estilo: One-Handed    -    Layout N/A        Iluminacion    -    Retroiluminado Si    -    Colores De La Retroiluminacion RGB    -    Teclas Iluminadas Si        Teclas    -    Vida De La Tecla 50 Millones De Pulsaciones    -    Anti-Ghosting Si    -    Marca Del Interruptor Outemu    -    Distancia De Recorrido 2 Mm    -    Tipo De Interruptor Outemu - Red    -    Fuerza De Activacion 50g        Compatibilidad    -    Tipos De Dispositivos Compatibles PC, Laptop    -    Plataformas De Software Compatibles Windows 10, Windows XP, Windows Vista, Windows 8, Windows 7, Linux, Android 4.2.2",
        //         "stock": 10
        //     },
        //     {
        //         "title": "Teclado Mecanico 60% Redragon Dragonborn K630 Black RGB Switch Brown",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/6950376772251_800.jpg",
        //         "price": 52813,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor Mecanico    -    Altura Del Producto 101,7 Mm    -    Ancho Del Producto 291,7 Mm    -    Profundidad Del Producto 36 Mm    -    Peso Total 570 G        Conectividad    -    Tipo De Conexion USB-C (Desmontable)    -    Largo Del Cable 1.8 M    -    Tipo De Conector USB        Caracteristicas    -    Caracteristicas Estilo: 60%    -    Layout Ingles        Iluminacion    -    Retroiluminado Si    -    Colores De La Retroiluminacion RGB Chroma    -    Teclas Iluminadas Si        Teclas    -    Vida De La Tecla 50 Millones De Pulsaciones    -    Anti-Ghosting Si    -    Marca Del Interruptor Redragon    -    Distancia De Recorrido Sin Especificar    -    Tipo De Interruptor Brown - Tactil    -    Fuerza De Activacion 45 G        Compatibilidad    -    Tipos De Dispositivos Compatibles PC, Laptop        Plataformas De Software Compatibles Windows, MacOs, Chrome OS",
        //         "stock": 10
        //     },
        //     {
        //         "title": "Teclado Mecanico Redragon Kumara K552 White Rainbow LED Switch Red",
        //         "thumbnail": "https://www.compugarden.com.ar/Temp/App_WebSite/App_PictureFiles/Items/K552-KR-WHITE_800.jpg",
        //         "price": 45484,
        //         "category": "teclados",

        //         "description": "General    -    Interruptor Mecanico    -    Altura Del Producto 155 Mm    -    Ancho Del Producto 375 Mm    -    Profundidad Del Producto 43 Mm    -    Peso Total 1060 G        Conectividad    -    Tipo De Conexion USB    -    Largo Del Cable 1.8 M    -    Tipo De Conector USB        Caracteristicas    -    Caracteristicas Estilo: Tenkeyless    -    Layout Español Latinoamerica        Iluminacion    -    Retroiluminado Si    -    Colores De La Retroiluminacion RGB Chorma    -    Teclas Iluminadas Si        Teclas    -    Vida De La Tecla Sin Especificar    -    Anti-Ghosting Si    -    Marca Del Interruptor Outemu MK2 Red    -    Distancia De Recorrido Sin Especificar    -    Tipo De Interruptor Tactil    -    Fuerza De Activacion Sin Especificar        Compatibilidad    -    Tipos De Dispositivos Compatibles PC, Laptop    -    Plataformas De Software Compatibles Windows, MacOS, Chorme OS",
        //         "stock": 10
        //     },
        //     {
        //         "title": "CONSOLA SONY PLAYSTATION 5",
        //         "thumbnail": "https://images.start.com.ar/1000031651.jpg",
        //         "price": 1299999,
        //         "category": "consola",
        //         "description": "Experimenta una velocidad sorprendente con una SSD de velocidad ultrarrápida, una inmersión más profunda con soporte para respuesta háptica, gatillos adaptables y audio 3D1, además de una generación completamente nueva de juegos de PlayStation. La PS5 edición digital es una versión completamente digital de la consola PS5 que no trae unidad de disco. Inicia sesión en tu cuenta de PlayStation Network y ve a PlayStation®Store para comprar y descargar juegos.",
        //         "stock": 100
        //     },
        //     {
        //         "title": "CONSOLA XBOX SERIES S DIGITAL 512GB",
        //         "thumbnail": "https://images.start.com.ar/RRS-00002.jpg",
        //         "price": 799999,
        //         "category": "consola",
        //         "description": "La Xbox Series S es una consola de videojuegos de la empresa estadounidense Microsoft, lanzada en noviembre de 2020. Es la versión más asequible de las dos consolas de próxima generación de Microsoft, la otra es la Xbox Series X. Aunque no tiene la misma capacidad de procesamiento que la Series X, sigue siendo una consola de alto rendimiento que permite a los jugadores disfrutar de la última tecnología de videojuegos.",
        //         "stock": 90
        //     },
        //     {
        //         "title": "MICROSOFT XBOX SERIES X 1TB + GAME PASS ULTIMATE 1 MES",
        //         "thumbnail": "https://images.start.com.ar/RRT-00002GPUL1M.jpg",
        //         "price": 1399999,
        //         "category": "consola",
        //         "description": "Cuenta con una potencia de procesamiento impresionante. Está equipada con un procesador personalizado AMD Zen 2 de 8 núcleos que funciona a una velocidad de reloj de 3,8 GHz, lo que significa que puede procesar una gran cantidad de datos de manera rápida y eficiente. Además, cuenta con una GPU AMD RDNA 2 personalizada que es capaz de ofrecer una resolución de hasta 8K y una tasa de refresco de 120Hz.",
        //         "stock": 50
        //     },
        //     {
        //         "title": "CONSOLA MICROSOFT XBOX SERIES S 1TB CARBON BLACK",
        //         "thumbnail": "https://images.start.com.ar/XXU-00002.jpg",
        //         "price": 999999,
        //         "category": "consola",
        //         "description": "Disfruta de una velocidad y rendimiento de nueva generación con nuestra biblioteca digital más grande hasta la fecha. Disfruta de mundos más dinámicos y tiempos de carga más rápidos, y agrega Xbox Game Pass Ultimate (la suscripción se vende por separado) para jugar a títulos nuevos el mismo día de su lanzamiento. Además, disfruta de cientos de juegos de alta calidad, como Minecraft, Forza Horizon 5 y Halo Infinite, con amigos en consola, PC y la nube.",
        //         "stock": 11
        //     },
        //     {
        //         "title": "CONSOLA PS4 PS4 SONY 1 TB",
        //         "thumbnail": "https://medias.musimundo.com/medias/size515-148829-01.jpg?context=bWFzdGVyfGltYWdlc3w0ODExM3xpbWFnZS9qcGVnfGFEY3dMMmhtTnk4eE1EUTNPREF3TURjek5ESXpPQzl6YVhwbE5URTFYekUwT0RneU9WOHdNUzVxY0djfDNmNmU0ZGVkNjAzODcyOTU2MGQ4MzgyMWQ4ZDFhODFmZDI0NDc4MDQ0MzlhOWIzMGMzOWE2MWNkMDJhMmIzYzg",
        //         "price": 929999,
        //         "category": "consola",
        //         "description": "Consola PS4 de 1 TB. Juego God of War Ragnarok. Bluetooth. Wi Fi. Incluye 1 cable HDMI, 1 cable USB, 1 auricular monoaural, 1 cable de alimentacion CA , 1 joystick, juego incluido God of War Ragnarok.",
        //         "stock": 8
        //     },
        //     {
        //         "title": "CONSOLA NINTENDO SWITCH OLED",
        //         "thumbnail": "https://acdn.mitiendanube.com/stores/456/610/products/sdes-924af898e50ce1baa217012725286616-1024-1024.webp",
        //         "price": 899999,
        //         "category": "consola",
        //         "description": "Juega en casa en el televisor o mientras viajas con una vibrante pantalla OLED de 7 pulgadas con el modelo OLED de Nintendo Switch. Además de la pantalla con colores vivos y un contraste nítido, el modelo OLED de Nintendo Switch incluye un soporte ancho ajustable, una base con un puerto LAN con cable para reproducir TV, 64 GB de almacenamiento interno y audio mejorado.    Nintendo Switch OLED, la nueva versión de la actual consola de Nintendo, con el unboxing oficial de su nuevo dispositivo incluye una pantalla OLED algo más grande, un nuevo dock y más espacio de almacenamiento, entre otras novedades. Así, ya podemos observar con todo lujo de detalles qué incluye la caja de esta nueva consola y qué diferencias podemos apreciar con el modelo actual de Switch.",
        //         "stock": 7
        //     },
        //     {
        //         "title": "Notebook Gamer ASUS ROG STRIX G513RM 15.6' WQHD IPS Ryzen 7 6800H 16GB DDR5 512GB SSD NVMe RTX 3060 W11 Home 165Hz + Office 365 1YEAR",
        //         "thumbnail": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_38338_Notebook_Gamer_ASUS_ROG_STRIX_G513RM_15.6__WQHD_IPS_Ryzen_7_6800H_16GB_DDR5_512GB_SSD_NVMe_RTX_3060_W11_Home_165Hz___Office_365_1YEAR_026ec590-grn.jpg",
        //         "price": 2121000,
        //         "category": "notebook",
        //         "description": "CARACTERISTICAS GENERALES    Color    Gris Oscuro    Sistema Operativo    Windows 11 Home    Tipo De Cpu    AMD    Tipo De Gpu    Nvidia GeForce    Batería Extraible    No    Modelo Gpu    RTX 3060    Modelo Cpu    Ryzen 7 6800H    Tipo    Notebook    Memoria Gpu    6 gb    Lector De Huellas    No    Familia Del Procesador    AMD RYZEN 7",
        //         "stock": 5
        //     },
        //     {
        //         "title": "Notebook Gamer Acer Nitro 5 15.6' FHD Core i5 11400H 8GB 256GB SSD NVMe GTX 1650 W11 144Hz GAME PASS ULTIMATE 1 MONTH",
        //         "thumbnail": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_38339_Notebook_Gamer_Acer_Nitro_5_15.6__FHD_Core_i5_11400H_8GB_256GB_SSD_NVMe_GTX_1650_W11_144Hz_GAME_PASS_ULTIMATE_1_MONTH_d0a3cc78-grn.jpg",
        //         "price": 859750,
        //         "category": "notebook",
        //         "description": "CARACTERISTICAS GENERALES    Color    Negro    Sistema Operativo    Windows 11 Home    Tipo De Cpu    Intel    Tipo De Gpu    Nvidia GeForce    Batería Extraible    No    Modelo Gpu    GTX 1650    Modelo Cpu    Core i5 11400H    Tipo    Notebook    Memoria Gpu    4 gb    Lector De Huellas    No    Familia Del Procesador Intel Core i5",
        //         "stock": 2
        //     },
        //     {
        //         "title": "NOTEBOOK GIGABYTE 15.6 AORUS 5 SE4 I7-12700H 16GB 512GB RTX3070 144HZ FHD W11H",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/32/notebook-gigabyte-156-aorus-5-se4-i712700h-16gb-512gb-rtx3070-144hz-fhd-w11h-0.jpg",
        //         "price": 2591320,
        //         "category": "notebook",
        //         "description": "Pantalla: 15.6  1920×1080 - Refresco 144Hz    Procesador: Intel Core i7 12700H    Memoria: 16GB DDR4 3200 MHz    Gráficos: NVIDIA GeForce RTX 3070 8GB    SSD: 512GB NVME PCIE 4.0    Sistema Operativo: Windows 11 Home    onectividad: Intel Wi-Fi 6E AX210 (Gig+), Bluetooth v5.2    Left side:    1 x HDMI 2.1    1 x mini DP 1.4    1 x USB 3.2 en1 Type-A)    1 x Audio combo jack    1 x RJ45    Right side:    1 x DC input    1x UHS-II SD Card Reader    1 x Thunderbolt™ 4 Type-C, support Power delivery)    2 x USB 3.2 Gen1 (Type-A)",
        //         "stock": 5
        //     },
        //     {
        //         "title": "NOTEBOOK GIGABYTE 14' AERO 14 OLED BMF I7-13700H 16GB 1TB RTX 4050 W11H",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/32/notebook-gigabyte-14-aero-14-oled-bmf-i713700h-16gb-1tb-rtx-4050-w11h-0.jpg",
        //         "price": 2560320,
        //         "category": "notebook",
        //         "description": "Características    Pantalla: 14' WQ+ 2.8K OLED (VESA DisplayHDR 600 True Black, 100% CI-P3, 90Hz, TUV Rheinland-certified, Eyesafe® 2.0)        Procesador: INTEL® CORE™ i7-13700H        Tarjeta de video: VIDIA® GeForce RTX™ 4050 (6GB GDDR6) Up to 1605MHz Boost Clock 45W Maximum Graphics Power with Dynamic Boost        RAM: PDDR5 16GB - No soporta Upgrade        SSD 1: M.2 Gen4 1TB        WIFI: Wifi 6E        Teclado: Español        Sistema Operativo: Windows 11 Home        Garantía: 1 año",
        //         "stock": 4
        //     },
        //     {
        //         "title": "NOTEBOOK ASUS 15.6' TUF DASH I5 12450H 16GB 512GB RTX 3050 W",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/32/notebook-asus-156-tuf-dash-i5-12450h-16gb-512gb-rtx-3050-w-0.jpg",
        //         "price": 1697070,
        //         "category": "notebook",
        //         "description": "PROCESADOR    Intel: Core i5    Modelo: 12450H        ALMACENAMIENTO    Disco Sólido: 512GB        PANTALLA    amaño: 15.6'    Resolucion: 1920x1080    Tecnologia: FHD, LED        MEMORIA RAM    Capacidad: 16GB DDR5    Formato: SODIMM    Expandible: Sí        GRAFICOS    Motor Gráfico: Nvidia    Modelo: Rtx 3050    VRAM: 4GB    MEMORIA: GDDR6        Windows 11 Home",
        //         "stock": 10
        //     },
        //     {
        //         "title": "NOTEBOOK ASUS 15.6' TUF GAMING RYZEN 7 4800H 16GB 512GB RTX R7",
        //         "thumbnail": "https://www.fullh4rd.com.ar/thumbnail/productos/32/notebook-asus-156-tuf-gaming-ryzen-7-4800h-16gb-512gb-rtx-r7-0.jpg",
        //         "price": 1565090,
        //         "category": "notebook",
        //         "description": "PROCESADOR    AMD: Ryzen 7 4800H 4.2Ghz 8MB Cache    Núcleos: 8 (16 Subprocesos)        LMACENAMIENTO    Disco SSD: 512GB        CONECTIVIDAD    Ethernet: Sí    Wi-Fi: Sí    Bluetooth: Sí        GRAFICOS    Motor ráfico: Nvidia    Modelo: Rtx 3050 GB GDDR6        MEMORIA RAM    Capacidad: 16GB    Formato: SODIMM    Expandible: No        OTRAS CARACTERISTICAS    Sensor Dactilar: No    Teclado Numérico: Sí    Cámara Web: Sí        PANTALLA    Tamaño: 5.6'    Resolucion: 1920x1080    Tecnologia: FHD, LED        PUERTOS    Usb 2.0: Sí    Hdmi: Sí    Audio/Mic 3.5: Sí        SISTEMA OPERATIVO    Windows 11 Home 64 Bits",
        //         "stock": 7
        //     }
        // ]

        // products = products.map((product, indice) => product = { code: indice + 1, ...product })

        // await productsModelo.deleteMany()
        // products = await productsModelo.insertMany(products)
        // console.log(products)

        // process.exit()
    } catch (error) {
        console.log("Error al conectar a DB", error.message)
    }
}

connDB()