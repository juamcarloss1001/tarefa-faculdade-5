
const TAXA_INICIAL = 5.00;
const PRECO_POR_KM = 2.00;


const UNINASSAU = {
    latitude: -3.742,
    longitude: -38.531
};

const campoCep = document.getElementById("cep");
const botaoCalcular = document.getElementById("btnCalcular");

const enderecoElemento = document.getElementById("endereco");
const distanciaElemento = document.getElementById("distancia");
const freteElemento = document.getElementById("frete");
const mensagemElemento = document.getElementById("mensagem");



botaoCalcular.addEventListener("click", calcularFrete);



async function calcularFrete() {

    const cep = campoCep.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        mensagemElemento.textContent = "Digite um CEP válido.";
        return;
    }

    mensagemElemento.textContent = "Consultando CEP...";

    try {

        
        const dadosCep = await consultarCep(cep);

        
        if (dadosCep.erro) {
            throw new Error("CEP não encontrado.");
        }

        mensagemElemento.textContent =
            "Localizando endereço...";


        
        const enderecoCompleto =
            `${dadosCep.logradouro}, ${dadosCep.bairro}, 
            ${dadosCep.localidade}, ${dadosCep.uf}`;


        
        const coordenadas =
            await obterCoordenadas(enderecoCompleto);


        if (!coordenadas) {
            throw new Error(
                "Não foi possível localizar esse endereço."
            );
        }


        mensagemElemento.textContent =
            "Calculando distância...";


        
        const distancia =
            calcularDistancia(
                UNINASSAU.latitude,
                UNINASSAU.longitude,
                coordenadas.latitude,
                coordenadas.longitude
            );


        
        const valorFrete =
            TAXA_INICIAL + (distancia * PRECO_POR_KM);


        
        enderecoElemento.textContent =
            `Endereço: ${enderecoCompleto}`;

        distanciaElemento.textContent =
            `Distância: ${distancia.toFixed(2)} km`;

        freteElemento.textContent =
            `Frete estimado: R$ ${valorFrete.toFixed(2)}`;

        mensagemElemento.textContent =
            "Cálculo realizado com sucesso!";

    } catch (erro) {

        mensagemElemento.textContent =
            `Erro: ${erro.message}`;
    }
}




async function consultarCep(cep) {

    const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
    );

    if (!resposta.ok) {
        throw new Error("Erro ao consultar o CEP.");
    }

    const dados = await resposta.json();

    return dados;
}



async function obterCoordenadas(endereco) {

    const enderecoCodificado =
        encodeURIComponent(endereco);

    const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${enderecoCodificado}` +
        `&format=jsonv2` +
        `&limit=1` +
        `&countrycodes=br`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(
            "Erro ao localizar o endereço."
        );
    }

    const resultados = await resposta.json();

    if (resultados.length === 0) {
        return null;
    }

    return {
        latitude: parseFloat(resultados[0].lat),
        longitude: parseFloat(resultados[0].lon)
    };
}



function calcularDistancia(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {

    const raioTerra = 6371;

    const lat1 =
        latitude1 * Math.PI / 180;

    const lat2 =
        latitude2 * Math.PI / 180;

    const diferencaLatitude =
        (latitude2 - latitude1) *
        Math.PI / 180;

    const diferencaLongitude =
        (longitude2 - longitude1) *
        Math.PI / 180;


    const a =
        Math.sin(diferencaLatitude / 2) *
        Math.sin(diferencaLatitude / 2) +

        Math.cos(lat1) *
        Math.cos(lat2) *

        Math.sin(diferencaLongitude / 2) *
        Math.sin(diferencaLongitude / 2);


    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return raioTerra * c;
}

