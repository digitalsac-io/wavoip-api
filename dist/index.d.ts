import { Microphone } from './features/multimedia/microphone/microphone';
import { MultimediaDevice as MultimediaDevice_2 } from '.';
import { Socket } from 'socket.io-client';
import { Speaker } from './features/multimedia/speaker/speaker';

export declare type AudioError = "NotAllowedError";

export declare type CallActive = CallProps & {
    connection_status: TransportStatus;
    audio_analyser: Promise<AnalyserNode>;
    mute(): Promise<{
        err: string | null;
    }>;
    unmute(): Promise<{
        err: string | null;
    }>;
    end(): Promise<{
        err: string | null;
    }>;
    onError(callback: (err: string) => void): void;
    onPeerMute(callback: () => void): void;
    onPeerUnmute(callback: () => void): void;
    onEnd(callback: () => void): void;
    onStats(callback: (stats: CallStats) => void): void;
    onConnectionStatus(callback: (status: TransportStatus) => void): void;
    onStatus(cb: (status: CallStatus) => void): void;
};

export declare type CallDirection = "INCOMING" | "OUTGOING";

export declare type CallOffer = CallProps & {
    accept(): Promise<{
        call: CallActive;
        err: null;
    } | {
        call: null;
        err: string;
    }>;
    reject(): Promise<{
        err: string | null;
    }>;
    onAcceptedElsewhere(callback: () => void): void;
    onRejectedElsewhere(callback: () => void): void;
    onUnanswered(cb: () => void): void;
    onEnd(cb: () => void): void;
    onStatus(cb: (status: CallStatus) => void): void;
};

export declare type CallOutgoing = CallProps & {
    onPeerAccept(callback: (call: CallActive) => void): void;
    onPeerReject(callback: () => void): void;
    onUnanswered(callback: () => void): void;
    onEnd(callback: () => void): void;
    mute(): Promise<{
        err: string | null;
    }>;
    unmute(): Promise<{
        err: string | null;
    }>;
    end(): Promise<{
        err: string | null;
    }>;
    onStatus(cb: (status: CallStatus) => void): void;
};

declare type CallPeer = {
    phone: string;
    displayName: string | null;
    profilePicture: string | null;
};

declare type CallProps = {
    id: string;
    type: CallType;
    device_token: string;
    direction: CallDirection;
    status: CallStatus;
    peer: CallPeer & {
        muted: boolean;
    };
    muted: boolean;
};

declare type CallStats = {
    rtt: {
        min: number;
        max: number;
        avg: number;
    };
    tx: {
        total: number;
        total_bytes: number;
        loss: number;
    };
    rx: {
        total: number;
        total_bytes: number;
        loss: number;
    };
};

export declare type CallStatus = "RINGING" | "CALLING" | "NOT_ANSWERED" | "ACTIVE" | "ENDED" | "REJECTED" | "FAILED" | "DISCONNECTED" | "DEVICE_RESTARTING";

declare type CallTransport<T extends CallType = CallType> = T extends "official" ? {
    type: T;
    sdpOffer: RTCSessionDescriptionInit;
} : {
    type: T;
    server: {
        host: string;
        port: string;
    };
};

declare type CallType = "official" | "unofficial";

export declare type Device = {
    token: string;
    status: DeviceStatus | null;
    qrcode: string | null;
    contact: DeviceManager["contact"];
    onStatus(cb: (status: DeviceStatus | null) => void): void;
    onQRCode(cb: (qrcode: string | null) => void): void;
    onContact(cb: (type: CallType, contact: {
        phone: string;
    } | null) => void): void;
    restart(): Promise<string | null>;
    logout(): Promise<string | null>;
    wakeUp(): Promise<DeviceAllInfo | null>;
    pairingCode(phone: string): Promise<{
        pairingCode: string;
        err: null;
    } | {
        pairingCode: null;
        err: string;
    }>;
    delete(): void;
};

declare type DeviceAllInfo = {
    name: string;
    profile_picture: string;
    status: DeviceStatus;
    phone: string;
    integrations: {
        baileys: unknown[];
        evolution: {
            id: number;
            name: string;
        }[];
    };
    call: {
        call_id: number | null;
        peer_made_call: boolean | null;
        accepted_peer: number | null;
        call_direction: string | null;
        call_active_date: string | null;
        call_duration_in_seconds: number | null;
    };
};

declare class DeviceManager extends EventEmitter<Events> {
    readonly socket: DeviceSocket;
    readonly token: string;
    qrcode: string | null;
    status: DeviceStatus | null;
    contact: {
        [k in CallType]: {
            phone: string;
        } | null;
    };
    private api;
    constructor(device_token: string);
    canCall(): {
        err: string;
    } | {
        err: null;
    };
    startCall(whatsapp_id: string): Promise<{
        call: {
            id: string;
            peer: CallPeer;
            transport: CallTransport;
        };
        err: null;
    } | {
        call: null;
        err: string;
    }>;
    endCall(): Promise<{
        err: null | string;
    }>;
    acceptCall(params: {
        call_id: string;
    }): Promise<{
        transport: CallTransport;
        err: null;
    } | {
        transport: null;
        err: string;
    }>;
    sendSdpAnswer(answer: RTCSessionDescriptionInit): void;
    rejectCall(call_id: string): Promise<{
        err: null | string;
    }>;
    mute(): Promise<{
        err: null | string;
    }>;
    unMute(): Promise<{
        err: null | string;
    }>;
    requestPairingCode(phone: string): Promise<{
        pairingCode: string;
        err: null;
    } | {
        pairingCode: null;
        err: string;
    }>;
    getInfos(): Promise<DeviceAllInfo | null>;
    restart(): Promise<string | null>;
    logout(): Promise<string | null>;
}

declare type DeviceResponse<TSuccessResult extends string | object | undefined = undefined> = DeviceResponseSuccess<TSuccessResult> | DeviceResponseError;

declare type DeviceResponseError = {
    type: "error";
    result: string;
    code?: "busy";
};

declare type DeviceResponseSuccess<TResult> = TResult extends undefined ? {
    type: "success";
} : {
    type: "success";
    result: TResult;
};

declare type DeviceSocket = Socket<DeviceSocketServerToClientEvents, DeviceSocketClientToServerEvents>;

declare type DeviceSocketClientToServerEvents = {
    "call:start": (phone: string, callback: (response: DeviceResponse<{
        id: string;
        peer: CallPeer;
        transport: CallTransport<"unofficial">;
    }>) => void) => void;
    "call:accept": (call: {
        id: string;
    }, callback: (response: DeviceResponse<CallTransport>) => void) => void;
    "call:sdp-answer": (answer: RTCSessionDescriptionInit) => void;
    "call:reject": (callId: string, callback: (response: DeviceResponse) => void) => void;
    "call:mute": (callback: (response: DeviceResponse) => void) => void;
    "call:unmute": (callback: (response: DeviceResponse) => void) => void;
    "call:end": (callback: (response: DeviceResponse) => void) => void;
    "device:qrcode": (callback: (qrcode: string | null) => void) => void;
    "device:status": (callback: (device_status: DeviceStatus | "") => void) => void;
    "whatsapp:pairing_code": (phone: string, callback: (response: DeviceResponse<string>) => void) => void;
};

declare type DeviceSocketServerToClientEvents = {
    "device:qrcode": (qrcode: string | null) => void;
    "device:status": (device_status: DeviceStatus | null) => void;
    "device:contact": (type: CallType, contact: {
        phone: string;
    } | null) => void;
    "call:offer": (call: {
        id: string;
        peer: CallPeer;
        type: CallType;
    }) => void;
    "call:error": (call_id: string, error: string) => void;
    "call:status": (call_id: string, status: CallStatus) => void;
    "call:stats": (call_id: string, stats: Stats) => void;
    "peer:accepted_elsewhere": (call_id: string) => void;
    "peer:rejected_elsewhere": (call_id: string) => void;
    "peer:mute": (call_id: string, mute: boolean) => void;
};

export declare type DeviceStatus = "UP" | "disconnected" | "close" | "connecting" | "open" | "error" | "restarting" | "hibernating" | "BUILDING" | "WAITING_PAYMENT" | "EXTERNAL_INTEGRATION_ERROR";

declare type ErrorSource = "microphone" | "audio";

declare class EventEmitter<TEvents extends EventsDefaultMap> {
    private listeners;
    emit<T extends keyof TEvents>(event: T, ...args: TEvents[T]): void;
    on<T extends keyof TEvents>(event: T, callback: Listener<TEvents, T>): () => void;
    off<T extends keyof TEvents>(event: T, callback: Listener<TEvents, T>): void;
    removeAllListeners<T extends keyof TEvents>(event: T): boolean;
}

declare type Events = {
    status: [status: DeviceStatus | null];
    qrcode: [qrcode: string | null];
    contact: [type: CallType, contact: {
        phone: string;
    } | null];
};

declare type Events_2 = {
    offer: [callOffer: CallOffer];
};

declare type EventsDefaultMap = {
    [k: string]: unknown[];
};

declare type Listener<TEvents extends EventsDefaultMap, TEvent extends keyof TEvents> = (...args: TEvents[TEvent]) => void;

export declare type MicError = DOMException;

export declare type MultimediaDevice = {
    type: "audio-in" | "audio-out";
    label: string;
    deviceId: string;
};

export declare class MultimediaError {
    readonly source: ErrorSource;
    readonly exception: DOMException;
    constructor(source: ErrorSource, exception: DOMException);
    toString(): "Permissão do alto falante foi negada" | "Permissão do microfone foi negada" | "Microfone não suporta os requisitos de áudio" | "Não é possível acessar o microfone, a página é insegura" | "Não foi possível acessar o microfone" | "Nenhum microfone encontrado" | "O hardware do microfone não pode ser inicializado" | "Algo falhou";
}

export declare type MultimediaSocketStatus = "CONNECTING" | "CONNECTED" | "ERROR" | "CLOSED";

declare type Stats = {
    rtt: {
        client: {
            min: number;
            max: number;
            avg: number;
        };
        whatsapp: {
            min: number;
            max: number;
            avg: number;
        };
    };
    tx: {
        total: number;
        total_bytes: number;
        loss: number;
    };
    rx: {
        total: number;
        total_bytes: number;
        loss: number;
    };
};

export declare type TransportStatus = "disconnected" | "connected" | "connecting";

export declare class Wavoip extends EventEmitter<Events_2> {
    private call_manager;
    private _devices;
    private _multimedia;
    constructor(params: {
        tokens: string[];
    });
    onOffer(cb: (callOffer: CallOffer) => void): void;
    get multimedia(): {
        microphone: Microphone;
        speaker: Speaker;
    };
    getMultimediaDevices(): {
        microphones: MultimediaDevice_2[];
        speakers: MultimediaDevice_2[];
    };
    /**
     * Attempts to start an outgoing call using one or more available devices.
     *
     * The method tries each device in sequence until one successfully initiates a call.
     * If all devices fail, it returns a detailed error report listing the reasons per device.
     *
     * @async
     * @function
     *
     * @param {Object} params - Parameters for starting the call.
     * @param {string[]} [params.fromTokens] - Specific device tokens to use.
     *   If omitted, all registered devices will be tried.
     * @param {string} params.to - The peer number (target) to call.
     *
     * @returns {Promise<Object>} A promise that resolves with the result.
     * @returns {Promise<Object>} return.call - The outgoing call on success, otherwise `null`.
     * @returns {Promise<null | Object>} return.err - `null` on success, or an error object if all devices failed.
     * @returns {Promise<string>} [return.err.message] - General error message.
     * @returns {Promise<Array<{ token: string, reason: string }>>} [return.err.devices] - Per-device failure details.
     *
     * @example
     * const result = await instance.startCall({ to: "5511999999999" });
     *
     * if (result.err) {
     *   console.error(result.err.message);
     *   result.err.devices.forEach(d => console.warn(`${d.token}: ${d.reason}`));
     * } else {
     *   console.log("Call started successfully:", result.call);
     * }
     */
    startCall(params: {
        fromTokens?: string[];
        to: string;
    }): Promise<{
        call: CallOutgoing;
        err: null;
    } | {
        call: null;
        err: {
            message: string;
            devices: {
                token: string;
                reason: string;
            }[];
        };
    }>;
    /**
     * Attempts to start an outgoing call using one or more available devices.
     *
     * This async generator yields the result of each device's call attempt,
     * and eventually returns the first successful call (if any).
     *
     * @async
     * @generator
     * @function
     *
     * @param {Object} params - Parameters for starting the call.
     * @param {string[]} [params.fromTokens] -
     *   Specific device tokens to use. If omitted, all registered devices
     *   will be tried.
     * @param {string} params.to - The peer number (target) to call.
     *
     * @yields {Object} result - Result of an individual device attempt.
     * @yields {null | Object} result.call - The call object if the device succeeded, otherwise `null`.
     * @yields {string} result.token - The token of the device being attempted.
     * @yields {string | null} result.err - Error message if the attempt failed.
     *
     * @returns {Promise<Object>} The first successful call attempt or a final failure result.
     * @returns {Promise<Object>} return.call - The successful `CallOutgoing` instance, or `null` if none succeeded.
     * @returns {Promise<string | null>} return.err - `null` if successful, or an error description.
     * @returns {Promise<string | undefined>} return.token - The device token used for the successful call.
     *
     * @example
     * for await (const result of instance.startCallIterator({ to: "5511999999999" })) {
     *   if (result.err) {
     *     console.warn(`Device ${result.token} failed: ${result.err}`);
     *   } else {
     *     console.log(`Call started via ${result.token}:`, result.call);
     *   }
     * }
     */
    startCallIterator(params: {
        fromTokens?: string[];
        to: string;
    }): AsyncGenerator<{
        call: null;
        token: string;
        err: string;
    }, {
        call: CallOutgoing;
        token: string;
    } | {
        call: null;
        err: string;
    }>;
    get devices(): Device[];
    getDevices(): Device[];
    /**
     * Add devices to instance
     * @param {string[]} tokens - Device tokens.
     * @returns {Device[]} Array containing the added devices
     */
    addDevices(tokens?: string[]): Device[];
    /**
     * Remove devices to instance
     * @param {string[]} tokens - Device tokens.
     * @returns {Device[]} Array containing the rest of the devices
     */
    removeDevices(tokens: string[]): Device[];
    /**
     * Iteratively wakes up devices that are in hibernation.
     *
     * This async generator attempts to wake each specified device (or all devices if none are specified)
     * and yields the result for each one.
     *
     * @async
     * @generator
     * @param {string[]} [tokens=[]] - Specific device tokens to wake up.
     *   If omitted, all registered devices will be checked.
     *
     * @yields {{ token: string, waken: boolean }} -
     *   The result for each device, indicating whether it was successfully awakened.
     *
     * @returns {AsyncGenerator<{token: string; waken: boolean;}, void, unknown>}
     *   When all devices have been processed.
     *
     * @example
     * for await (const result of instance.wakeUpDevicesIterator(["abc123", "xyz789"])) {
     *   console.log(`${result.token}: ${result.waken ? "awake" : "still asleep"}`);
     * }
     */
    wakeUpDevicesIterator(tokens?: string[]): AsyncGenerator<{
        token: string;
        waken: boolean;
    }, void, unknown>;
    /**
     * Wakes up devices that are in hibernation.
     *
     * This method attempts to wake each specified device (or all devices if none are specified)
     * and returns an array of Promises, each resolving to that device's wake-up result.
     *
     * @param {string[]} [tokens=[]] - Specific device tokens to wake up.
     *   If an empty array is passed, all registered devices will be targeted.
     *
     * @returns {Promise<{ token: string, waken: boolean }>[]}
     * An array of Promises, each resolving to an object containing:
     * - `token`: The device token.
     * - `waken`: Whether the device was successfully awakened.
     *
     * @example
     * const results = await Promise.all(instance.wakeUpDevices(["abc123", "xyz789"]));
     * results.forEach(r => {
     *   console.log(`${r.token}: ${r.waken ? "awake" : "still asleep"}`);
     * });
     */
    wakeUpDevices(tokens?: string[]): Promise<{
        token: string;
        waken: boolean;
    }>[];
    private bindDeviceEvents;
}

export { }
