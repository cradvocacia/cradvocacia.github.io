// C&R Advocacia – interações do site (sem dependências)
(() => {
  'use strict';

  // ---------- Números oficiais (fonte única) ----------
  const OFICIAIS = [
    { nome: 'número geral do escritório', digitos: '44988560456' },
    { nome: 'Dr. Rafael Dias', digitos: '44920002303' },
    { nome: 'Dr. Creverson Junior', digitos: '44999982871' },
  ];

  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ---------- Escolha do advogado (dialog nativo) ----------
  const dialog = document.getElementById('chooser');
  const waLink = (digits, text) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

  const prepararMensagens = (assunto) => {
    dialog.querySelectorAll('[data-wa]').forEach((link) => {
      const nome = link.dataset.name;
      const saudacao = nome ? `Olá, ${nome}.` : 'Olá.';
      const corpo = assunto
        ? ` Vi o site do escritório e gostaria de conversar sobre ${assunto}.`
        : ' Vi o site do escritório e gostaria de conversar sobre um caso.';
      link.href = waLink(link.dataset.wa, saudacao + corpo);
    });
  };

  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-contact]').forEach((trigger) => {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        prepararMensagens(trigger.dataset.topic || '');
        dialog.showModal();
      });
    });
    // Fecha ao clicar fora da caixa
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    // Fecha depois de escolher (o WhatsApp abre em nova aba)
    dialog.querySelectorAll('[data-wa]').forEach((link) => link.addEventListener('click', () => dialog.close()));
  }
  // Sem suporte a <dialog>: os links seguem para a seção #contato, que já tem todos os contatos.

  // ---------- Verificador de número ----------
  const form = document.getElementById('checker');
  const input = document.getElementById('checker-input');
  const result = document.getElementById('checker-result');

  const normalizar = (valor) => {
    let d = valor.replace(/\D/g, '');
    if (d.startsWith('55') && d.length >= 12) d = d.slice(2); // DDI do Brasil
    if (d.startsWith('0')) d = d.replace(/^0+/, '');          // 0 de operadora/DDD
    return d;
  };

  const verificar = (valor) => {
    const d = normalizar(valor);
    if (d.length < 8) return { tipo: 'vazio' };
    // Compara pelos 8 últimos dígitos e, se houver DDD, exige DDD 44
    const achado = OFICIAIS.find((o) => {
      if (!o.digitos.endsWith(d.slice(-8))) return false;
      if (d.length >= 10 && !d.startsWith('44')) return false;
      return true;
    });
    return achado ? { tipo: 'ok', nome: achado.nome } : { tipo: 'nao' };
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const r = verificar(input.value);
    result.className = 'checker-result';
    if (r.tipo === 'vazio') {
      result.textContent = 'Digite o número completo, com DDD.';
      return;
    }
    if (r.tipo === 'ok') {
      result.classList.add('is-ok');
      result.textContent = `Este é um número oficial: ${r.nome}. Mesmo assim, se pedirem pagamento fora do combinado, ligue para confirmar.`;
    } else {
      result.classList.add('is-bad');
      result.textContent = 'Este número não é do escritório. Não faça pagamentos nem envie documentos. Confirme ligando para um dos números oficiais desta seção.';
    }
  });

  // ---------- Carrossel de vídeos ----------
  const reels = document.getElementById('reels');
  const reelBtns = document.querySelectorAll('.reels-btn');
  if (reels && reelBtns.length) {
    const atualizar = () => {
      const max = reels.scrollWidth - reels.clientWidth - 4;
      reelBtns[0].disabled = reels.scrollLeft <= 4;
      reelBtns[1].disabled = reels.scrollLeft >= max;
    };
    reelBtns.forEach((btn) => btn.addEventListener('click', () => {
      const item = reels.querySelector('.reel');
      const passo = item ? item.getBoundingClientRect().width + 20 : 360;
      reels.scrollBy({ left: Number(btn.dataset.dir) * passo, behavior: 'smooth' });
    }));
    reels.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }

  // ---------- Ano no rodapé ----------
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
