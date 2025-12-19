/**
 * Common types used across components
 */

/**
 * Image type with metadata and focal point information
 * Used by components that display images with advanced positioning
 */
export type Image = {
    url: string;
    meta_data?: {
        height?: string;
        width?: string;
    };
    focal_point?: {
        x?: string;
        y?: string;
    };
};
