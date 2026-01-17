// /widgets/positive-thoughts-widget.js
class PositiveThoughtsWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.thoughts = [];
    this.current = null;
  }

  async connectedCallback() {
    const title = this.getAttribute("data-title") ?? "Pensée positive";
    const jsonUrl = this.getAttribute("data-json-url");
    const suggestUrl = this.getAttribute("data-suggest-url");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
        .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; max-width: 520px; }
        .title { font-weight: 700; margin: 0 0 8px; }
        .thought { margin: 0 0 12px; line-height: 1.35; }
        .meta { font-size: 12px; opacity: 0.75; margin: 0 0 12px; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; }
        button, a.btn {
          border: 1px solid #ccc; background: #fff; border-radius: 10px;
          padding: 8px 10px; cursor: pointer; text-decoration: none; color: inherit;
          font-size: 14px;
        }
        button:hover, a.btn:hover { background: #f6f6f6; }
      </style>
      <div class="card" role="region" aria-label="${this._escape(title)}">
        <p class="title">${this._escape(title)}</p>
        <p class="thought" id="thought">Chargement…</p>
        <p class="meta" id="meta"></p>
        <div class="actions">
          <button type="button" id="next">Nouvelle pensée</button>
          ${suggestUrl ? `<a class="btn" id="suggest" target="_blank" rel="noopener">Suggérer une pensée</a>` : ``}
        </div>
      </div>
    `;

    if (suggestUrl) {
      this.shadowRoot.getElementById("suggest").setAttribute("href", suggestUrl);
    }

    this.shadowRoot.getElementById("next").addEventListener("click", () => {
      this._pickAndRender();
    });

    if (jsonUrl) {
      await this._loadFromJson(jsonUrl);
      this._pickAndRender();
    } else {
      // fallback minimal
      this.thoughts = [{ text: "Je progresse, un pas à la fois.", lang: "fr" }];
      this._pickAndRender();
    }
  }

  async _loadFromJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Impossible de charger le JSON (${res.status})`);
    const data = await res.json();
    // attendu: { thoughts: [{text, lang, source?}] }
    this.thoughts = Array.isArray(data?.thoughts) ? data.thoughts : [];
  }

  _pickAndRender() {
    const thoughtEl = this.shadowRoot.getElementById("thought");
    const metaEl = this.shadowRoot.getElementById("meta");

    if (!this.thoughts.length) {
      thoughtEl.textContent = "Aucune pensée disponible.";
      metaEl.textContent = "";
      return;
    }

    const idx = Math.floor(Math.random() * this.thoughts.length);
    this.current = this.thoughts[idx];

    thoughtEl.textContent = this.current.text ?? "";
    const parts = [];
    if (this.current.lang) parts.push(this.current.lang.toUpperCase());
    if (this.current.source) parts.push(this.current.source);
    metaEl.textContent = parts.join(" · ");
  }

  _escape(s) {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}

customElements.define("positive-thoughts-widget", PositiveThoughtsWidget);
