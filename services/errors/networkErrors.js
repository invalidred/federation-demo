const NetworkErrorType = {
    IO: 'I/O error',
    ARGUMENT_ERROR: 'Argument Error',
    OPERATIONAL_ERROR: 'Operational Error',
    MISC_ERROR:'Miscellaneous Error',
    UNKNOWN: 'UNKNOWN'
}

/*interface NetworkError {
    type: NetworkErrorType,
    description: string,
    detail: string
}*/

// Adapted from http://osr507doc.sco.com/en/netguide/disockD.error_codes.html
const networkErrorsInfo = /*: Record<string, NetworkError> = */{
    EALREADY: {
        type: NetworkErrorType.IO,
        description: 'Operation already in progress',
        detail: ''
    },
    EINPROGRESS: {
        type: NetworkErrorType.IO,
        description: 'Operation now in progress',
        detail: ''
    },
    EWOULDBLOCK: {
        type: NetworkErrorType.IO,
        description: 'Operation would block',
        detail: ''
    },
    EADDRINUSE: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Address already in use',
        detail: 'TCP and UDP. An attempt was made to create a socket with a port which has already been allocated.'
    },
    EADDRNOTAVAIL: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Can\'t assign requested address',
        detail: 'TCP and UDP. An attempt was made to create a socket with a network address for which no network interface exists.'
    },
    EAFNOSUPPORT: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Address family not supported by protocol family',
        detail: ''
    },
    EDESTADDRREQ: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Destination address required',
        detail: ''
    },
    EMSGSIZE: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Message too long',
        detail: ''
    },
    ENOTSOCK: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Socket operation on non-socket',
        detail: ''
    },
    EOPNOTSUPP: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Operation not supported on socket',
        detail: ''
    },
    EPROTONOSUPPORT: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Protocol not supported',
        detail: 'Creating a socket. Unknown protocol or protocol not supported.'
    },
    EPROTOTYPE: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Protocol wrong type for socket',
        detail: ''
    },
    ESOCKTNOSUPPORT: {
        type: NetworkErrorType.ARGUMENT_ERROR,
        description: 'Socket type not supported',
        detail: ''
    },
    ECONNREFUSED: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Connection refused',
        detail: 'Socket connection. The host refused service for some reason. This error is usually caused by a server process not being present at the requested name.'
    },
    ECONNRESET: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Connection reset by peer',
        detail: 'TCP. The remote peer forced the session to be closed.'
    },
    EISCONN: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Socket is already connected',
        detail: 'IP and UDP. An attempt was made to establish a connection on a socket that already has one or an attempt was made to send a datagram with the destination address specified and the socket is already connected. TCP. An attempt was made to establish a connection on a socket that already has one.'
    },
    ENETDOWN: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Network is down',
        detail: 'Socket connection. Status information received by the client host from the underlying communication services indicates the net or the remote host is down.'
    },
    ENETRESET: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Network dropped connection on reset',
        detail: ''
    },
    ENETUNREACH: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Network is unreachable',
        detail: ''
    },
    ENOBUFS: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'No buffer space available',
        detail: 'TCP, IP, and UDP. Any Socket Operation. The system lacks sufficient memory for an internal data structure.'
    },
    ENOTCONN: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Socket is not connected',
        detail: 'UDP. An attempt was made to send a datagram, but no destination address is specified, and the socket has not been connected.'
    },
    ESHUTDOWN: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Cannot send after socket shutdown',
        detail: ''
    },
    ETIMEDOUT: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Connection timed out',
        detail: 'Socket connection. After failing to establish a connection during a period of time (excessive retransmissions), the system decided there was no point in retrying any more. The cause for this error is usually that the remote host is down or that problems in the network resulted in transmissions being lost.'
    },
    ESOCKETTIMEDOUT: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Connection timed out',
        detail: 'Socket connection. After failing to establish a connection during a period of time (excessive retransmissions), the system decided there was no point in retrying any more. The cause for this error is usually that the remote host is down or that problems in the network resulted in transmissions being lost.'
    },
    ECONNABORTED: {
        type: NetworkErrorType.OPERATIONAL_ERROR,
        description: 'Software caused connection abort',
        detail: ''
    },
    EHOSTDOWN: {
        type: NetworkErrorType.MISC_ERROR,
        description: 'Host is down',
        detail: 'Socket connection. Status information received by the client host from the underlying communication services indicates the net or the remote host is down.'
    },
    EHOSTUNREACH: {
        type: NetworkErrorType.MISC_ERROR,
        description: 'No route to host',
        detail: 'Socket connection. These operational errors can occur either because the network or host is unknown (no route to the host or network is present) or because status information to that effect has been delivered to the client host by the underlying communication services.'
    },
    ENOPROTOOPT: {
        type: NetworkErrorType.MISC_ERROR,
        description: 'Protocol not available',
        detail: ''
    },
}

/*type Optional<T> = T | undefined | null*/

function getUnknowError(errorCode/*: Optional<string>*/) {
    return {
        type: NetworkErrorType.UNKNOWN,
        description: `${errorCode}: is unkown consider adding it to networkErrors`,
        detail: '@edge/errrors/src/networkErrors/getUnknownError'
    }
}

function getNetworkErrorInfo(errorCode /*: Optional<string>): NetworkError */) {
    const errorInfo = networkErrorsInfo[errorCode || '']
    return errorInfo ? errorInfo : getUnknowError(errorCode)
}

module.exports = {
    getNetworkErrorInfo
}