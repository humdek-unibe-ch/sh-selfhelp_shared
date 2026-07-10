/*

SPDX-FileCopyrightText: 2026 Humdek, University of Bern

SPDX-License-Identifier: MPL-2.0

*/

import type { INavigationMenuItem } from './navigationPayload';



/**

 * Normalises menu max_depth: null/undefined/0 means unlimited.

 */

export function resolveMenuMaxDepth(maxDepth: number | null | undefined): number | null {

    if (maxDepth === null || maxDepth === undefined || maxDepth <= 0) {

        return null;

    }



    return maxDepth;

}



/**

 * Strips nested children beyond the configured depth so renderers do not

 * expand deeper levels in dropdown/mega panels.

 */

export function clampMenuItemsAtDepth(

    items: INavigationMenuItem[],

    maxDepth: number | null,

    depth = 0,

): INavigationMenuItem[] {

    return items.map((item) => {

        const atLimit = maxDepth !== null && depth >= maxDepth;

        const children = item.children ?? [];



        return {

            ...item,

            children: atLimit ? [] : clampMenuItemsAtDepth(children, maxDepth, depth + 1),

        };

    });

}


