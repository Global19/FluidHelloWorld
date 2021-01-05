/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { getTinyliciousContainer } from '@fluidframework/get-tinylicious-container';

import { IKeyValueDataObject, ContainerRuntimeFactory } from './kvpair-dataobject';
import { jsRenderView as renderView } from './view';

let createNew = false;
if (location.hash.length === 0) {
    createNew = true;
    location.hash = Date.now().toString();
}
const documentId = location.hash.substring(1);
document.title = documentId;

// Nested promises
getTinyliciousContainer(documentId, ContainerRuntimeFactory, createNew).then((container) => {
    container.request({ url: '/' }).then((response) => {
        if (response.status === 200) {
            renderView(response.value as IKeyValueDataObject, document.getElementById('content') as HTMLDivElement);
        } else {
            console.log('Error loading');
        }
    });
});

// or async await

async function start(): Promise<void> {
    // Get Fluid Container (creates if new url)
    const container = await getTinyliciousContainer(documentId, ContainerRuntimeFactory, createNew);

    // Since we're using a ContainerRuntimeFactoryWithDefaultDataStore, our dice roller is available at the URL "/".
    const url = '/';
    const response = await container.request({ url });

    // Verify the response to make sure we got what we expected.
    if (response.status !== 200 || response.mimeType !== 'fluid/object') {
        throw new Error(`Unable to retrieve data object at URL: "${url}"`);
    } else if (response.value === undefined) {
        throw new Error(`Empty response from URL: "${url}"`);
    }

    // In this app, we know our container code provides a default data object that is an IDiceRoller.
    const keyValueDataObject: IKeyValueDataObject = response.value;

    // Given an IDiceRoller, we can render the value and provide controls for users to roll it.
    const div = document.getElementById('content') as HTMLDivElement;
    renderView(keyValueDataObject, div);
}

start().catch((error) => console.error(error));
