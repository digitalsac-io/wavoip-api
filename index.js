// Wrapper de compatibilidade para usar a API nova (@wavoip/wavoip-api)
// com a interface antiga esperada pelo webphone atual.

// Importa o bundle UMD vendorizado localmente (mais compatível com Webpack 4)
import WavoipPkg from "./dist/index.umd.js";

// Extrai a classe Wavoip do bundle UMD
const WavoipModern = WavoipPkg?.Wavoip || WavoipPkg?.default || WavoipPkg;

// Emissor simples compatível com socket.on/off
class SimpleEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  off(event, handler) {
    if (!this.listeners[event]) return;
    if (!handler) {
      this.listeners[event] = [];
      return;
    }
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  emit(event, ...args) {
    (this.listeners[event] || []).forEach((h) => {
      try {
        h(...args);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

// Classe compatível com a API LEGADA usada no projeto
class LegacyWavoip {
  constructor() {
    this.instance = null;
    this.deviceToken = null;
    this.offer = null;
    this.activeCall = null;
    this.socket = new SimpleEmitter(); // exposto como socket para o código antigo
  }

  async connect(token) {
    // Cria instância moderna com o token
    if (!this.instance) {
      this.instance = new WavoipModern({ tokens: [token] });
    } else {
      this.instance.addDevices([token]);
    }
    this.deviceToken = token;

    // Registrar listener de ofertas (incoming)
    this.instance.onOffer((offer) => {
      this.offer = offer;
      this._wireOfferEvents(offer);
      // Emite evento "signaling" no formato antigo
      this.socket.emit("signaling", {
        tag: "offer",
        content: {
          from_tag: offer?.peer?.displayName || null,
          phone: offer?.peer?.phone || null,
          profile_picture: offer?.peer?.profilePicture || null,
        },
      });
    });

    // Retorna a si mesmo (compatível com webphone.js que guarda whatsapp_instance)
    return this;
  }

  async callStart(params) {
    const number = params?.whatsappid || params?.phone || "";
    const clean = String(number).replace(/\D/g, "");

    const result = await this.instance.startCall({
      to: clean,
      fromTokens: [this.deviceToken],
    });

    if (result.err) {
      return { type: "error", result: result.err?.message || result.err };
    }

    const call = result.call;
    this.activeCall = call;
    this._wireOutgoingCallEvents(call);

    return {
      type: "success",
      result: {
        profile_picture: call?.peer?.profilePicture || null,
      },
    };
  }

  async acceptCall() {
    if (!this.offer) return;
    const { call, err } = await this.offer.accept();
    if (err) {
      return { type: "error", result: err };
    }
    this.activeCall = call;
    this._wireActiveCallEvents(call);
    this.socket.emit("signaling", { tag: "accept" });
    return { type: "success" };
  }

  async rejectCall() {
    if (!this.offer) return;
    const { err } = await this.offer.reject();
    if (!err) {
      this.socket.emit("signaling", { tag: "reject" });
    }
    return { type: err ? "error" : "success", result: err || null };
  }

  async endCall() {
    if (!this.activeCall) return;
    const { err } = await this.activeCall.end();
    if (!err) {
      this.socket.emit("signaling", { tag: "terminate" });
    }
    return { type: err ? "error" : "success", result: err || null };
  }

  // --- Helpers internos para mapear eventos ---
  _wireOfferEvents(offer) {
    offer.onAcceptedElsewhere(() => {
      this.socket.emit("signaling", { tag: "accept_elsewhere" });
    });
    offer.onRejectedElsewhere(() => {
      this.socket.emit("signaling", { tag: "reject_elsewhere" });
    });
    offer.onUnanswered(() => {
      this.socket.emit("signaling", { tag: "terminate" });
    });
    offer.onEnd(() => {
      this.socket.emit("signaling", { tag: "terminate" });
    });
    offer.onStatus((status) => {
      if (status === "ACTIVE") {
        this.socket.emit("signaling", { tag: "accept" });
      } else if (status === "REJECTED" || status === "ENDED") {
        this.socket.emit("signaling", { tag: "terminate" });
      }
    });
  }

  _wireOutgoingCallEvents(call) {
    call.onPeerAccept((activeCall) => {
      this.activeCall = activeCall;
      this._wireActiveCallEvents(activeCall);
      this.socket.emit("signaling", { tag: "accept" });
    });
    call.onPeerReject(() => {
      this.socket.emit("signaling", { tag: "reject" });
    });
    call.onUnanswered(() => {
      this.socket.emit("signaling", { tag: "terminate" });
    });
    call.onStatus((status) => {
      if (status === "ACTIVE") {
        this.socket.emit("signaling", { tag: "accept" });
      } else if (status === "REJECTED" || status === "ENDED") {
        this.socket.emit("signaling", { tag: "terminate" });
      }
    });
    call.onEnd(() => {
      this.socket.emit("signaling", { tag: "terminate" });
    });
  }

  _wireActiveCallEvents(call) {
    call.onStatus((status) => {
      if (status === "ENDED") {
        this.socket.emit("signaling", { tag: "terminate" });
      }
    });
    call.onEnd(() => {
      this.socket.emit("signaling", { tag: "terminate" });
    });
  }
}

export default LegacyWavoip;
export { LegacyWavoip as Wavoip };
