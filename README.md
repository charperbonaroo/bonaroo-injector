## Installing

    npm i bonaroo-injector

## Usage (Node / plain JS)

    > const { getNextPersonId } = require("bonaroo-injector");
    undefined
    > getNextPersonId("K40AA0A", "no-verify")
    'K40AA0E'
    > getNextPersonId("K40AA0E")
    'K40AA0P'

## Relevant source

See src/core/Injector.ts

## Exports
