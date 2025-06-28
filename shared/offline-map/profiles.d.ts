export declare const PROFILE_DISPLAY_NAMES: Record<string, string>;
export declare function getProfileDisplayName(profile: string): string;
export interface DefaultRouteProfile {
    id: string;
    name: string;
    mode: string;
    costing: string;
    description: string;
    icon: string;
    useCase: string;
}
export declare const DEFAULT_ROUTE_PROFILES: DefaultRouteProfile[];
