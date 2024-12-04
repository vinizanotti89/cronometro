document.addEventListener('DOMContentLoaded', () => {
    class ArmazenamentoLocal {
        static salvarVoltas(voltas) {
            localStorage.setItem('historicoVoltas', JSON.stringify(voltas));
        }

        static recuperarVoltas() {
            const voltas = localStorage.getItem('historicoVoltas');
            return voltas ? JSON.parse(voltas) : [];
        }

        static limparVoltas() {
            localStorage.removeItem('historicoVoltas');
        }
    }

    class GerenciadorCronometro {
        constructor() {
            this.historicoVoltas = [];
            this.totalVoltas = 0;
            this.melhorVolta = null;
            this.piorVolta = null;
        }

        registrarVolta(tempo) {
            if (this.historicoVoltas.length === 0 || 
                this.historicoVoltas[this.historicoVoltas.length - 1].tempo !== tempo) {
                
                this.totalVoltas++;
                
                // Restante do código permanece igual
                if (!this.melhorVolta || tempo < this.melhorVolta) {
                    this.melhorVolta = tempo;
                }
                
                if (!this.piorVolta || tempo > this.piorVolta) {
                    this.piorVolta = tempo;
                }
                
                this.historicoVoltas.push({
                    numero: this.totalVoltas,
                    tempo: tempo,
                    dataRegistro: new Date()
                });
            }
        }

        gerarRelatorio() {
            const mediaVoltas = this.historicoVoltas.reduce((sum, volta) => 
                sum + volta.tempo, 0) / (this.totalVoltas || 1);
            
            return {
                totalVoltas: this.totalVoltas,
                melhorVolta: this.melhorVolta,
                piorVolta: this.piorVolta,
                mediaVoltas: mediaVoltas
            };
        }

        limparHistorico() {
            this.historicoVoltas = [];
            this.totalVoltas = 0;
            this.melhorVolta = null;
            this.piorVolta = null;
        }
    }

    class ExportadorVoltas {
        constructor(gerenciadorCronometro) {
            this.gerenciador = gerenciadorCronometro;
            this.botaoExportar = this.criarBotaoExportar();
        }

        criarBotaoExportar() {
            const botao = document.createElement('button');
            botao.textContent = 'Exportar Voltas';
            botao.disabled = true;
            botao.id = 'botao-exportar';
            
            botao.addEventListener('click', () => this.exportarVoltas());
            
            const controlesContainer = document.getElementById('controles');
            controlesContainer.appendChild(botao);
            
            return botao;
        }

        atualizarEstadoBotao() {
            // Ativa o botão apenas se houver 2 ou mais voltas
            this.botaoExportar.disabled = 
                this.gerenciador.historicoVoltas.length < 2;
        }

        exportarVoltas() {
            const opcoes = [
                { id: 'csv', nome: 'CSV' },
                { id: 'json', nome: 'JSON' },
                { id: 'txt', nome: 'Texto Plano' }
            ];

            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
                    <div style="background: white; padding: 20px; border-radius: 10px;">
                        <h3>Selecione o formato de exportação:</h3>
                        ${opcoes.map(opcao => `
                            <label>
                                <input type="radio" name="formato" value="${opcao.id}">
                                ${opcao.nome}
                            </label><br>
                        `).join('')}
                        <button id="confirmar-exportacao">Exportar</button>
                        <button id="cancelar-exportacao">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const confirmarBotao = modal.querySelector('#confirmar-exportacao');
            const cancelarBotao = modal.querySelector('#cancelar-exportacao');

            confirmarBotao.addEventListener('click', () => {
                const formato = modal.querySelector('input[name="formato"]:checked')?.value;
                if (formato) {
                    this.executarExportacao(formato);
                }
                document.body.removeChild(modal);
            });

            cancelarBotao.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }

        executarExportacao(formato) {
            const voltas = this.gerenciador.historicoVoltas;
            let conteudo = '';

            switch (formato) {
                case 'csv':
                    conteudo = 'Número,Tempo,Data de Registro\n' + 
                        voltas.map(volta => 
                            `${volta.numero},${volta.tempo},${volta.dataRegistro}`
                        ).join('\n');
                    break;
                case 'json':
                    conteudo = JSON.stringify(voltas, null, 2);
                    break;
                case 'txt':
                    conteudo = voltas.map(volta => 
                        `Volta ${volta.numero}: ${this.formatarTempo(volta.tempo)} (${volta.dataRegistro})`
                    ).join('\n');
                    break;
            }

            const blob = new Blob([conteudo], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `voltas_cronometro.${formato}`;
            link.click();
            URL.revokeObjectURL(url);
        }

        formatarTempo(milissegundos) {
            const totalSegundos = Math.floor(milissegundos / 1000);
            const horas = Math.floor(totalSegundos / 3600);
            const minutos = Math.floor((totalSegundos % 3600) / 60);
            const segundos = totalSegundos % 60;
            const ms = Math.floor((milissegundos % 1000));

            return `${
                horas.toString().padStart(2, '0')
            }:${
                minutos.toString().padStart(2, '0')
            }:${
                segundos.toString().padStart(2, '0')
            }.${
                ms.toString().padStart(3, '0')
            }`;
        }
    }

    class TemaManager {
        constructor() {
            this.temaAtual = 'claro';
            this.botaoTema = this.criarBotaoTema();
            this.aplicarTema();
        }

        criarBotaoTema() {
            const botao = document.createElement('button');
            botao.textContent = '🌓 Trocar Tema';
            botao.onclick = () => this.toggleTema();
            document.body.appendChild(botao);
            return botao;
        }

        toggleTema() {
            this.temaAtual = this.temaAtual === 'claro' ? 'escuro' : 'claro';
            this.aplicarTema();
        }

        aplicarTema() {
            const estilos = {
                claro: {
                    background: '#f4f4f4',
                    texto: '#333',
                    displayBackground: '#fff',
                    displayTexto: '#000'
                },
                escuro: {
                    background: '#333',
                    texto: '#0f0',
                    displayBackground: '#000',
                    displayTexto: '#0f0'
                }
            };

            const tema = estilos[this.temaAtual];
            document.body.style.backgroundColor = tema.background;
            document.body.style.color = tema.texto;
            document.getElementById('display').style.backgroundColor = tema.displayBackground;
            document.getElementById('display').style.color = tema.displayTexto;
        }
    }

    class Cronometro {
        constructor() {
            this.inicio = 0;
            this.tempoDecorrido = 0;
            this.intervalo = null;
            this.rodando = false;

            // Elementos do DOM
            this.display = document.getElementById('display');
            this.listaVoltas = document.getElementById('listaVoltas');
            
            // Elementos de estatísticas
            this.totalVoltasElement = document.getElementById('totalVoltas');
            this.melhorVoltaElement = document.getElementById('melhorVolta');
            this.piorVoltaElement = document.getElementById('piorVolta');
            this.mediaVoltasElement = document.getElementById('mediaVoltas');

            // Gerenciadores
            this.gerenciador = new GerenciadorCronometro();
            this.exportador = new ExportadorVoltas(this.gerenciador);
            this.temaManager = new TemaManager();

            // Vincular métodos aos botões
            document.querySelector('button[onclick="cronometro.iniciar()"]')
                .addEventListener('click', () => this.iniciar());
            document.querySelector('button[onclick="cronometro.parar()"]')
                .addEventListener('click', () => this.parar());
            document.querySelector('button[onclick="cronometro.volta()"]')
                .addEventListener('click', () => this.volta());
            document.querySelector('button[onclick="cronometro.resetar()"]')
                .addEventListener('click', () => this.resetar());

            // Recuperar voltas salvas
            const voltasSalvas = ArmazenamentoLocal.recuperarVoltas();
            this.gerenciador.historicoVoltas = voltasSalvas;
            this.atualizarVoltas();
            this.atualizarEstatisticas();
            this.exportador.atualizarEstadoBotao();
        }

        iniciar() {
            if (!this.rodando) {
                this.inicio = Date.now() - this.tempoDecorrido;
                this.intervalo = setInterval(() => this.atualizar(), 10);
                this.rodando = true;
                console.log(iniciar())
            }
        }

        parar() {
            if (this.rodando) {
                clearInterval(this.intervalo);
                this.tempoDecorrido = Date.now() - this.inicio;
                this.rodando = false;
            }
        }

        volta() {
            const tempoAtual = this.tempoDecorrido;
            
            // Adiciona apenas uma volta por clique
            this.gerenciador.registrarVolta(tempoAtual);
            
            // Reiniciar o cronômetro se estiver rodando
            if (this.rodando) {
                clearInterval(this.intervalo);
                this.inicio = Date.now();
                this.intervalo = setInterval(() => this.atualizar(), 10);
            }
            
            this.atualizarVoltas();
            this.atualizarEstatisticas();
            this.exportador.atualizarEstadoBotao();
        
            // Salvar voltas no localStorage
            ArmazenamentoLocal.salvarVoltas(this.gerenciador.historicoVoltas);
        }

        resetar() {
            clearInterval(this.intervalo);
            this.inicio = 0;
            this.tempoDecorrido = 0;
            this.rodando = false;
            this.display.textContent = '00:00:00.000';
            this.listaVoltas.innerHTML = '';
            this.gerenciador.limparHistorico();
            this.atualizarEstatisticas();
            this.exportador.atualizarEstadoBotao();
            
            // Limpar voltas no localStorage
            ArmazenamentoLocal.limparVoltas();
        }

        atualizar() {
            this.tempoDecorrido = Date.now() - this.inicio;
            this.display.textContent = this.formatarTempo(this.tempoDecorrido);
        }

        formatarTempo(milissegundos) {
            const totalSegundos = Math.floor(milissegundos / 1000);
            const horas = Math.floor(totalSegundos / 3600);
            const minutos = Math.floor((totalSegundos % 3600) / 60);
            const segundos = totalSegundos % 60;
            const ms = Math.floor((milissegundos % 1000));

            return `${
                horas.toString().padStart(2, '0')
            }:${
                minutos.toString().padStart(2, '0')
            }:${
                segundos.toString().padStart(2, '0')
            }.${
                ms.toString().padStart(3, '0')
            }`;
        }

        atualizarVoltas() {
            const voltas = this.gerenciador.historicoVoltas;
            this.listaVoltas.innerHTML = voltas.map(volta => 
                `<li>Volta ${volta.numero}: ${this.formatarTempo(volta.tempo)}</li>`
            ).join('');
        }

        atualizarEstatisticas() {
            const relatorio = this.gerenciador.gerarRelatorio();
            
            this.totalVoltasElement.textContent = `Total de Voltas: ${relatorio.totalVoltas}`;
            this.melhorVoltaElement.textContent = `Melhor Volta: ${this.formatarTempo(relatorio.melhorVolta || 0)}`;
            this.piorVoltaElement.textContent = `Pior Volta: ${this.formatarTempo(relatorio.piorVolta || 0)}`;
            this.mediaVoltasElement.textContent = `Média de Voltas: ${this.formatarTempo(relatorio.mediaVoltas || 0)}`;
        }
    }

    // Inicialização global do cronômetro
    window.cronometro = new Cronometro();
});