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
		
		/* Boutons principaux UdeS */
		.btn-udes,
		button {
		  background-color: #018849;     /* vert UdeS (couleur principale) */
		  color: #ffffff;                /* texte blanc */
		  padding: 0.6em 1.2em;
		  font-size: 0.95rem;
		  font-weight: 600;
		  border: none;
		  border-radius: 8px;
		  text-transform: uppercase;
		  letter-spacing: 0.5px;
		  cursor: pointer;
		  transition: background-color 0.2s ease, box-shadow 0.2s ease;
		}

		/* Variation bordure | fond transparent */
		.btn-udes-outline,
		a.btn {
		  background-color: transparent;
		  border: 2px solid #018849;
		  color: #018849;
		}

		/* Survol pour boutons foncés */
		.btn-udes:hover,
		button:hover {
		  background-color: #016f3b;      /* teinte plus foncée au hover */
		  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.17);
		}

		/* Survol pour boutons outlines */
		.btn-udes-outline:hover,
		a.btn:hover {
		  background-color: #018849;
		  color: #ffffff;
		  border: 2px solid #018849;
		}



        .card {
	  position: relative;   /* ancre le ::before à la carte */
	  overflow: hidden;     /* empêche le fond de déborder hors du cadre */
	  border: 1px solid #ddd;
	  border-radius: 12px;
	  padding: 16px;
	  max-width: 520px;
	  background: #fff;
	  }
		/* Image de fond (filigrane) */
        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('UdS.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 140%;

          /* Atténuation */
          opacity: 0.12;
          filter: saturate(0.6) brightness(1.1);

          z-index: 0;
          pointer-events: none;
        }
		/* Contenu au-dessus du fond */
        .card > * {
          position: relative;
          z-index: 1;
        }
        .title { font-weight: 700; margin: 0 0 8px; }
        .thought { margin: 0 0 12px; line-height: 1.35; }
        .meta { font-size: 12px; opacity: 0.75; margin: 0 0 12px; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; }
        button,
		a.btn {
		  border: none;
		  padding: 0.6em 1.2em;
		  font-size: 14px;
		  font-weight: 600;
		  text-transform: uppercase;
		  cursor: pointer;
		  transition: background-color 0.2s ease, box-shadow 0.2s ease;
		}

		/* Bouton principal */
		button {
		  background-color: #018849;
		  color: #fff;
		  border-radius: 8px;
		}

		/* Bouton secondaire (lien) */
		a.btn {
		  background-color: transparent;
		  border: 2px solid #018849;
		  color: #018849;
		  border-radius: 8px;
		}

		/* Hover interactions */
		button:hover {
		  background-color: #016f3b;
		  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.17);
		}

		a.btn:hover {
		  background-color: #018849;
		  color: #fff;
		}
      </style>
      <div class="card" role="region" aria-label="${this._escape(title)}">
        <p class="title">${this._escape(title)}</p>
        <p class="thought" id="thought">Chargement…</p>
        <p class="meta" id="meta"></p>
        <div class="actions">
          <button type="button" id="next">Encore</button>
          ${suggestUrl ? `<a class="btn" id="suggest" target="_blank" rel="noopener">Faire une suggestion</a>` : ``}
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
    //if (this.current.lang) parts.push(this.current.lang.toUpperCase());
    //if (this.current.source) parts.push(this.current.source);
    metaEl.textContent = parts.join(" · ");
  }

  _escape(s) {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}

customElements.define("positive-thoughts-widget", PositiveThoughtsWidget);
