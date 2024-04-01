export const checkMatchLabels = (a?: Record<string, string>, b?: Record<string, string>): boolean => {
    if (!a || !b) return false;
    return !Object.entries(a).some(
        ([k, v]) => b[k] !== v
    )
}

export const checkMatchExpressions = (matchExpressions: any, podLabels: any): boolean => true
