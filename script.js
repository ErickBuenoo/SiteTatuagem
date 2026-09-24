
    /* ============================================================================
    Yasmin Tattoo — comportamento do site
    ----------------------------------------------------------------------------
    Sem dependências. Cada bloco é independente e degrada sem quebrar:
    1. CONFIG e link de WhatsApp      5. Filtros da galeria
    2. Cabeçalho e menu mobile        6. Lightbox
    3. Revelação ao rolar             7. FAQ (acordeão)
    4. Navegação ativa                8. Números, voltar ao topo, ano
    ========================================================================== */
    (function () {
        "use strict";

    /* ==========================================================================
       1. CONFIG — dados do estúdio (único lugar a mexer)
       ========================================================================== */
    const SITE = {
        artist: "Yasmin",                       // TROCAR
    handle: "yasmin_tattooart",
    whatsapp: "5547988166336",                // +55 47 98816-6336
    city: "Jaraguá do Sul",
    state: "SC",
    // mensagem pré-preenchida: já chega com o que você precisa para orçar
    waMsg: "Olá, Yasmin! Vim pelo site e quero um orçamento.%0A" +
    "Estilo/referência: %0A" +
    "Tamanho aproximado: %0A" +
    "Local do corpo: %0A" +
    "Cobertura de tatuagem existente? (sim/não): %0A" +
    "Melhor dia para atender: "
            };
    const WA_URL = "https://wa.me/" + SITE.whatsapp + "?text=" + SITE.waMsg;

    document.querySelectorAll("[data-wa]").forEach(function (el) {
        el.href = WA_URL;
    el.target = "_blank";
    el.rel = "noopener";
    el.addEventListener("click", function () {
        // TROCAR: troque por gtag('event', 'click_whatsapp', {...}) se usar GA4 direto
        window.dataLayer = window.dataLayer || [];
    const onde = el.closest("header") ? "header"
    : el.closest(".mobile-bar") ? "barra_mobile"
    : el.closest(".menu") ? "menu"
    : el.closest(".cta-final") ? "cta_final"
    : "conteudo";
    window.dataLayer.push({event: "click_whatsapp", origem: onde, telefone: SITE.whatsapp });
                });
            });

    /* ==========================================================================
       2. CABEÇALHO E MENU MOBILE
       ========================================================================== */
    const hdr = document.getElementById("hdr");
    const aoRolar = function () {hdr.classList.toggle("solid", window.scrollY > 40); };
    aoRolar();
    addEventListener("scroll", aoRolar, {passive: true });

    const burger = document.getElementById("burger");
    const menu = document.getElementById("menu");
    if (burger && menu) {
                const alternar = function (abrir) {
        menu.classList.toggle("aberto", abrir);
    burger.setAttribute("aria-expanded", String(abrir));
    document.body.classList.toggle("travado", abrir);
    if (abrir) { const p = menu.querySelector("a"); if (p) p.focus({preventScroll: true }); }
                };
    burger.addEventListener("click", function () {
        alternar(!menu.classList.contains("aberto"));
                });
    menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { alternar(false); });
                });
    addEventListener("keydown", function (e) {
                    if (e.key === "Escape" && menu.classList.contains("aberto")) {alternar(false); burger.focus(); }
                });
            }

    /* ==========================================================================
       3. REVELAÇÃO AO ROLAR
       ========================================================================== */
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revelaveis = document.querySelectorAll(".reveal");
    if (semMovimento || !("IntersectionObserver" in window)) {
        revelaveis.forEach(function (el) { el.classList.add("in"); });
            } else {
                const ioR = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("in"); ioR.unobserve(e.target); }
        });
                }, {threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    revelaveis.forEach(function (el) {ioR.observe(el); });
            }

    /* ==========================================================================
       4. NAVEGAÇÃO ATIVA
       ========================================================================== */
    const alvos = [...document.querySelectorAll("section[id]")];
    const linksNav = [...document.querySelectorAll('.nav a[href^="#"]')];
    if ("IntersectionObserver" in window && alvos.length) {
                const ioSec = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
            if (!e.isIntersecting) return;
            const id = e.target.id;
            linksNav.forEach(function (a) {
                const ativo = a.getAttribute("href") === "#" + id;
                if (ativo) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
            });
        });
                }, {rootMargin: "-45% 0px -50% 0px" });
    alvos.forEach(function (s) {ioSec.observe(s); });
            }

    /* ==========================================================================
       5. FILTROS DA GALERIA
       ========================================================================== */
    const chips = [...document.querySelectorAll(".chip")];
    const tiles = [...document.querySelectorAll(".tile")];
    const contador = document.getElementById("contador");
    const rotulo = {
        "*": "peças", "blackwork": "blackwork", "preto-cinza": "preto e cinza",
    "fine-line": "fine line", "cobertura": "cobertura", "old-school": "old school",
    "piercing": "piercing"
            };
    function filtrar(f) {
        let visiveis = 0;
    tiles.forEach(function (t) {
                    const tags = (t.dataset.tags || "").split(" ");
    const mostra = f === "*" || tags.indexOf(f) !== -1;
    t.classList.toggle("hide", !mostra);
    if (mostra) {t.classList.add("in"); visiveis++; }
                });
    if (contador) {
        contador.textContent = visiveis + " " + (rotulo[f] || "peças") +
        (f === "*" ? " no portfólio" : " · clique para ampliar");
                }
            }
    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
            filtrar(chip.dataset.f);
        });
            });
    if (tiles.length) filtrar("*");

    /* ==========================================================================
       6. LIGHTBOX
       ========================================================================== */
    const lb = document.getElementById("lb");
    if (lb && tiles.length) {
                const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    const btnPrev = lb.querySelector(".lb-prev");
    const btnNext = lb.querySelector(".lb-next");
    const btnFechar = lb.querySelector(".lb-fechar");
    let atual = 0, ultimoFoco = null;

    const visiveis = function () { return tiles.filter(function (t) { return !t.classList.contains("hide"); }); };

    function desenhar(i) {
                    const lista = visiveis();
    if (!lista.length) return;
    atual = (i + lista.length) % lista.length;
    const t = lista[atual];
    lbImg.src = t.dataset.full;
    lbImg.alt = t.querySelector("img") ? t.querySelector("img").alt : "";
    lbCap.textContent = (t.dataset.caption || "") + "  ·  " + (atual + 1) + " / " + lista.length;
    // pré-carrega vizinhos para a troca ser instantânea
    [atual + 1, atual - 1].forEach(function (k) {
                        const viz = lista[(k + lista.length) % lista.length];
    if (viz && viz.dataset.full) { const p = new Image(); p.src = viz.dataset.full; }
                    });
                }
    function abrir(t) {
        ultimoFoco = document.activeElement;
    const lista = visiveis();
    desenhar(lista.indexOf(t));
    lb.classList.add("on");
    document.body.classList.add("travado");
    btnFechar.focus({preventScroll: true });
                }
    function fechar() {
        lb.classList.remove("on");
    lbImg.removeAttribute("src");
    document.body.classList.remove("travado");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({preventScroll: true });
                }
    tiles.forEach(function (t) {t.addEventListener("click", function () { abrir(t); }); });
    btnPrev.addEventListener("click", function () {desenhar(atual - 1); });
    btnNext.addEventListener("click", function () {desenhar(atual + 1); });
    btnFechar.addEventListener("click", fechar);
    lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
    addEventListener("keydown", function (e) {
                    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft") desenhar(atual - 1);
    if (e.key === "ArrowRight") desenhar(atual + 1);
                });

    // troca de imagem na horizontal (mobile)
    let x0 = null;
    lb.addEventListener("touchstart", function (e) {x0 = e.touches[0].clientX; }, {passive: true });
    lb.addEventListener("touchend", function (e) {
                    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
                    if (Math.abs(dx) > 45) desenhar(atual + (dx < 0 ? 1 : -1));
    x0 = null;
                }, {passive: true });
            }

    /* ==========================================================================
       7. FAQ (ACORDEÃO)
       ========================================================================== */
    document.querySelectorAll(".qa-q").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const qa = btn.closest(".qa");
            const aberta = qa.hasAttribute("aberta");
            // fecha as outras para manter a leitura focada
            document.querySelectorAll(".qa[aberta]").forEach(function (outra) {
                outra.removeAttribute("aberta");
                outra.querySelector(".qa-q").setAttribute("aria-expanded", "false");
            });
            if (!aberta) {
                qa.setAttribute("aberta", "");
                btn.setAttribute("aria-expanded", "true");
            }
        });
            });

    /* ==========================================================================
       8. NÚMEROS, VOLTAR AO TOPO, ANO
       ========================================================================== */
    const nums = document.querySelectorAll("[data-contar]");
    if (nums.length) {
                const animar = function (el) {
                    const fim = parseInt(el.dataset.contar, 10) || 0;
    if (semMovimento) {el.textContent = String(fim); return; }
    const dur = 1100, t0 = performance.now();
    const passo = function (t) {
                        const p = Math.min((t - t0) / dur, 1);
    el.textContent = String(Math.round(fim * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(passo);
                    };
    requestAnimationFrame(passo);
                };
    if ("IntersectionObserver" in window) {
                    const ioN = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
            if (e.isIntersecting) { animar(e.target); ioN.unobserve(e.target); }
        });
                    }, {threshold: 0.5 });
    nums.forEach(function (n) {ioN.observe(n); });
                } else {
        nums.forEach(animar);
                }
            }

    const aoTopo = document.getElementById("aoTopo");
    if (aoTopo) {
        addEventListener("scroll", function () {
            aoTopo.classList.toggle("visivel", window.scrollY > window.innerHeight * 0.9);
        }, { passive: true });
    aoTopo.addEventListener("click", function () {
        scrollTo({ top: 0, behavior: semMovimento ? "auto" : "smooth" });
                });
            }

    /* ==========================================================================
       9. MONTADOR DE ORÇAMENTO
       Monta a mensagem do WhatsApp conforme as escolhas do visitante. Nada é
       enviado por este site: o link abre o WhatsApp já com o texto pronto.
       ========================================================================== */
    const orcForm = document.getElementById("orcForm");
    if (orcForm) {
                const saida = document.getElementById("orcTexto");
    const botao = document.getElementById("orcEnviar");
    const escolhas = { };
    const rotulos = {
        estilo: "Estilo",
    tamanho: "Tamanho",
    local: "Local do corpo",
    cobertura: "Cobertura de tatuagem antiga",
    referencia: "Referência"
                };
    const ordem = ["estilo", "tamanho", "local", "cobertura", "referencia"];

    function montarMensagem() {
                    const linhas = ["Olá, " + SITE.artist + "! Vim pelo site e quero um orçamento."];
    ordem.forEach(function (campo) {
                        if (escolhas[campo]) linhas.push(rotulos[campo] + ": " + escolhas[campo]);
                    });
    const campos = orcForm.querySelectorAll("input");
    const extras = [
    ["Nome", campos[0] && campos[0].value.trim()],
    ["Quando pretende fazer", campos[1] && campos[1].value.trim()],
    ["Observação", campos[2] && campos[2].value.trim()]
    ];
    extras.forEach(function (par) { if (par[1]) linhas.push(par[0] + ": " + par[1]); });
    if (linhas.length === 1) {
        linhas.push("Ainda não sei os detalhes — pode me ajudar a definir?");
                    }
    return linhas.join("\n");
                }

    function atualizar() {
                    const texto = montarMensagem();
    saida.textContent = texto;
    botao.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(texto);
                }

    // chips: um selecionado por grupo (funciona como botão de rádio)
    orcForm.querySelectorAll("[data-campo]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const campo = btn.dataset.campo;
            orcForm.querySelectorAll('[data-campo="' + campo + '"]').forEach(function (irmao) {
                irmao.setAttribute("aria-pressed", String(irmao === btn));
            });
            escolhas[campo] = btn.dataset.valor;
            atualizar();
        });
                });

    orcForm.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("input", atualizar);
                });

    botao.addEventListener("click", function () {
        // TROCAR: usar gtag('event','click_whatsapp_orcamento',{...}) se preferir GA4 direto
        window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "click_whatsapp_orcamento",
    origem: "montador",
    selecao: escolhas,
    preencheu_contato: !!(orcForm.querySelector("#orcNome").value.trim())
                    });
                });

    atualizar();   // mostra a prévia já na carga da página
            }

    /* ==========================================================================
       10. ANO DO RODAPÉ E SELO DE RASCUNHO
       ========================================================================== */
    const ano = document.getElementById("ano");
    if (ano) ano.textContent = String(new Date().getFullYear());

    // selo de rascunho: visível no começo, discreto depois (some sozinho na publicação)
    const flag = document.getElementById("flag");
    if (flag) setTimeout(function () {flag.classList.add("apagado"); }, 5000);
        })();
