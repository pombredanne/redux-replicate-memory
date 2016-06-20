# redux-replicate-memory

[![npm version](https://img.shields.io/npm/v/redux-replicate-memory.svg?style=flat-square)](https://www.npmjs.com/package/redux-replicate-memory)
[![npm downloads](https://img.shields.io/npm/dm/redux-replicate-memory.svg?style=flat-square)](https://www.npmjs.com/package/redux-replicate-memory)

Replicator for [`redux-replicate`](https://github.com/loggur/redux-replicate) designed to *synchronously* persist the state of [`redux`](https://github.com/reactjs/redux) stores in memory.  Useful for universal rendering of replicator query results and optimistic queries.


## Table of contents

1.  [Installation](#installation)
2.  [Usage](#usage)
3.  [Example using `react-redux-provide`](#example-using-react-redux-provide)
4.  [Example using `compose`](#example-using-compose)


## Installation

```
npm install redux-replicate-memory --save
```


## Usage

Use with [`redux-replicate`](https://github.com/loggur/redux-replicate).


## Example using [`react-redux-provide`](https://github.com/loggur/react-redux-provide)

```js
// src/replication.js

import memory from 'redux-replicate-memory';
import { theme } from './providers/index';

theme.replication = {
  reducerKeys: ['themeName'],
  replicator: memory
};
```


## Example using `compose`

```js
import { createStore, combineReducers, compose } from 'redux';
import replicate from 'redux-replicate';
import memory from 'redux-replicate-memory';
import reducers from './reducers';

const initialState = {
  wow: 'such storage',
  very: 'cool'
};

const key = 'superCoolStorageUnit';
const reducerKeys = true;
const replicator = memory;
const replication = replicate({ key, reducerKeys, replicator });
const create = compose(replication)(createStore);
const store = create(combineReducers(reducers), initialState);
```
