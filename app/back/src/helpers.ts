export const checkMatchLabels = (a: Record<string, string>, b: Record<string, string>): boolean => {
    return !Object.entries(a).some(
        ([k, v]) => b[k] !== v
    )
}

export const checkMatchExpressions = (matchExpressions: any, podLabels: any): boolean => true
