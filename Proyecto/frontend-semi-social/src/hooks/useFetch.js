import { useState, useCallback, useEffect } from 'react';

/**
 * @param {string} url
 * @param {Object} options
 * @param {string} [method='GET']
 * @param {boolean} [manual=false]
 * @param {boolean} [requiresAuth=true]
 * @returns {Object}
 */
export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!options.manual);
    const [error, setError] = useState(null);

    const { method = 'GET', manual = false, requiresAuth = true } = options;

    const getHeaders = useCallback((customHeaders = {}, isFormData = false) => {
        const headers = isFormData ? {} : {
            "Content-Type": "application/json",
            ...customHeaders,
        };

        if (requiresAuth) {
            const idToken = localStorage.getItem('idToken');
            const token = localStorage.getItem('token');
            const tokenToUse = idToken || token;
            if (tokenToUse) {
                headers.Authorization = `Bearer ${tokenToUse}`;
            }
        }
        return headers;
    }, [requiresAuth]);

    /**
     * Función principal para ejecutar la petición.
     * Soporta body como objeto JSON o como FormData (para subida de archivos).
     */
    const execute = useCallback(async (body = null, overrideOptions = {}) => {
        setLoading(true);
        setError(null);

        const controller = new AbortController();

        const finalUrl = overrideOptions.url || url;
        const finalMethod = overrideOptions.method || method;
        const isFormData = body instanceof FormData;

        try {
            const config = {
                method: finalMethod,
                headers: getHeaders(options.headers, isFormData),
                signal: controller.signal,
            };

            if (body && finalMethod !== 'GET' && finalMethod !== 'HEAD') {
                config.body = isFormData ? body : JSON.stringify(body);
            }

            const response = await fetch(finalUrl, config);

            const textData = await response.text();
            let jsonData = null;
            try {
                jsonData = textData ? JSON.parse(textData) : null;
            } catch (e) {
                jsonData = textData;
            }

            if (!response.ok) {
                const errorMessage =
                    jsonData?.message || jsonData?.error ||
                    `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            setData(jsonData);
            return jsonData;

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Petición cancelada');
            } else {
                setError(err);
                throw err;
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [url, method, getHeaders, options.headers]);

    useEffect(() => {
        const shouldExecute = !manual;
        if (shouldExecute) {
            execute();
        }
    }, [execute, manual]);

    return { data, loading, error, execute };
};
