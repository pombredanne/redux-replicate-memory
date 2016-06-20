const ENTIRE_STATE = '__ENTIRE_STATE__';
const EMPTY_STATE = '__EMPTY_STATE__';

window.dataStore = {};
window.queryStore = {};

const dataStore = window.dataStore;
const queryStore = window.queryStore;

function getItemKey(key, reducerKey) {
  if (reducerKey) {
    return `${key}/${reducerKey}`;
  }

  return key;
}

function getQueryableKey(state, reducerKey = ENTIRE_STATE) {
  if (typeof state === 'undefined') {
    state = EMPTY_STATE;
  } else if (typeof state !== 'string') {
    state = JSON.stringify(state);
  }

  return `${encodeURIComponent(reducerKey)}=${encodeURIComponent(state)}`;
}

function getInitialState({ key, reducerKey }, setState) {
  setState(dataStore[getItemKey(key, reducerKey)]);
}

function onStateChange({ key, reducerKey, queryable }, state, nextState) {
  const itemKey = getItemKey(key, reducerKey);
  const prevQueryableKey = getQueryableKey(dataStore[itemKey], reducerKey);
  const prevKeyMap = queryStore[prevQueryableKey];
  const queryableKey = getQueryableKey(nextState, reducerKey);
  const keyMap = queryStore[queryableKey] || {};

  dataStore[itemKey] = nextState;

  if (queryable) {
    if (prevKeyMap) {
      delete prevKeyMap[key];
    }

    if (!queryStore[queryableKey]) {
      queryStore[queryableKey] = keyMap;
    }

    keyMap[key] = true;
  }
}

function handleQuery(query, options, setResult) {
  let keys = null;

  if (typeof query !== 'object') {
    query = { [ENTIRE_STATE]: query };
  }

  Object.keys(query).forEach(reducerKey => {
    const state = query[reducerKey];
    const queryableKey = getQueryableKey(state, reducerKey, false);
    const keyMap = queryStore[queryableKey];

    if (keys) {
      for (let key in keys) {
        if (typeof keyMap[key] === 'undefined') {
          delete keys[key];
        }
      }
    } else {
      keys = keyMap || {};
    }
  });

  keys = Object.keys(keys);

  if (options.length) {
    setResult(keys && keys.length || 0);
  } else if (options.keys) {
    setResult(keys);
  } else {
    getMultiple(keys, options.select, setResult);
  }
}

function getMultiple(keys, reducerKeys, setResult) {
  const result = [];

  for (let key of keys) {
    let item = {};

    result.push(item);

    for (let reducerKey of reducerKeys) {
      getInitialState({ key, reducerKey }, state => {
        item[reducerKey] = state;
      });
    }
  }

  setResult(result);
}

const memoryReplicator = {
  getInitialState, onStateChange, handleQuery
};

export default memoryReplicator;
