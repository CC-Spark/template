/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react';
import { useComponentType } from '../hooks/useComponentType';
import { DeleteToolboxButton } from './DeleteToolboxButton';
import { MoveToolboxButton } from './MoveToolboxButton';
import { useDesignState } from '../hooks/useDesignState';
import { useLabels } from '../hooks/useLabels';
import { DesignOverlay } from './DesignOverlay';

export const DesignFrame = ({
    componentId,
    children,
    name,
    parentId,
    regionId,
    localized = false,
    showFrame = false,
    showToolbox = true,
    isMoveable = true,
}: React.PropsWithChildren<{
    componentId?: string;
    name: string;
    localized?: boolean;
    parentId?: string;
    regionId?: string;
    showToolbox?: boolean;
    showFrame?: boolean;
    isMoveable?: boolean;
}>): React.JSX.Element => {
    const componentType = useComponentType(componentId ?? '');
    const { deleteComponent } = useDesignState();
    const labels = useLabels();
    const nodeRef = React.useRef<HTMLDivElement>(null);

    const handleDelete = React.useCallback(
        (event: React.MouseEvent) => {
            // Stop propagation so we don't select the component as well when
            // this bubbles up.
            event.stopPropagation();

            if (componentId) {
                deleteComponent({
                    componentId,
                    sourceComponentId: parentId ?? '',
                    sourceRegionId: regionId ?? '',
                });
            }
        },
        [deleteComponent, componentId, parentId, regionId]
    );

    const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

    const classes = ['pd-design__frame', showFrame && 'pd-design__frame--visible'].filter(Boolean).join(' ');

    // TODO: For the frame label, when there is not enough space above the component to display it, we
    // need to display it inside the container instead.
    return (
        <div className={classes} ref={nodeRef}>
            {showFrame && (
                <>
                    <div className="pd-design__frame--x" />
                    <div className="pd-design__frame--y" />
                </>
            )}
            <div className="pd-design__frame__label" onMouseDown={stopPropagation}>
                {componentType?.image && (
                    <span className="pd-design__icon">
                        <img src={componentType.image} alt="" />
                    </span>
                )}
                <span className="pd-design__frame__name">{name}</span>
                {!localized && (
                    <span className="pd-design__frame__fallback-badge">{labels.fallback ?? 'Fallback'}</span>
                )}
            </div>
            {showToolbox && (
                <div className="pd-design__frame__toolbox">
                    {isMoveable && <MoveToolboxButton title={labels.moveComponent ?? 'Move component'} />}
                    <DeleteToolboxButton
                        title={labels.deleteComponent ?? 'Delete component'}
                        onMouseDown={stopPropagation}
                        onClick={handleDelete}
                    />
                </div>
            )}
            <DesignOverlay />
            {children}
        </div>
    );
};

DesignFrame.defaultProps = {
    parentId: undefined,
    componentId: undefined,
    showToolbox: true,
    regionId: undefined,
    showFrame: false,
};
