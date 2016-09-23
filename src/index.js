const dataStore = {};
const queryStore = {};

if (typeof window !== 'undefined') {
  window.memoryReplicator = { dataStore, queryStore };
}

const ENTIRE_STATE = '__ENTIRE_STATE__';
const EMPTY_STATE = '__EMPTY_STATE__';

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

function getInitialState({ store, reducerKey, setState }) {
  const { key } = store;
  setState(dataStore[getItemKey(key, reducerKey)]);
}

function onStateChange({ store, reducerKey, nextState, queryable }) {
  const { key } = store;
  const itemKey = getItemKey(key, reducerKey);
  const prevQueryableKey = getQueryableKey(dataStore[itemKey], reducerKey);
  const prevKeyMap = queryStore[prevQueryableKey];
  const queryableKey = getQueryableKey(nextState, reducerKey);
  const keyMap = queryStore[queryableKey] || {};

  dataStore[itemKey] = nextState;

  if (queryable && queryableKey !== prevQueryableKey) {
    if (prevKeyMap) {
      delete prevKeyMap[key];
    }

    if (!queryStore[queryableKey]) {
      queryStore[queryableKey] = keyMap;
    }

    keyMap[key] = true;
  }
}

function handleQuery({ query, options, setResult }) {
  const { begin = 0 } = options;
  let keys = null;

  if (typeof query !== 'object') {
    query = { [ENTIRE_STATE]: query };
  }

  Object.keys(query).forEach(reducerKey => {
    const state = query[reducerKey];
    const queryableKey = getQueryableKey(state, reducerKey, false);
    const keyMap = queryStore[queryableKey] || {};

    if (keys) {
      for (let key in keys) {
        if (typeof keyMap[key] === 'undefined') {
          delete keys[key];
        }
      }
    } else {
      keys = { ...keyMap };
    }
  });

  keys = Object.keys(keys);

  if (options.sortBy) {
    for (let reducerKey in options.sortBy) {
      if (options.select.indexOf(reducerKey) < 0) {
        options.select.push(reducerKey);
      }
    }

    getMultiple(keys, options.select, result => {
      for (let reducerKey in options.sortBy) {
        let ascending = options.sortBy[reducerKey] > 0;

        result.sort(ascending
          ? (a, b) => {
            if (a[reducerKey] > b[reducerKey]) {
              return 1;
            } else if (a[reducerKey] < b[reducerKey]) {
              return -1;
            } else {
              return 0;
            }
          }
          : (a, b) => {
            if (a[reducerKey] < b[reducerKey]) {
              return 1;
            } else if (a[reducerKey] > b[reducerKey]) {
              return -1;
            } else {
              return 0;
            }
          }
        );
      }

      if (typeof options.end !== 'undefined') {
        setResult(result.slice(begin, options.end));
      } else if (options.limit) {
        setResult(result.slice(begin, begin + options.limit));
      } else {
        setResult(result);
      }
    });
  } else if (options.length) {
    setResult(keys && keys.length || 0);
  } else if (options.keys) {
    setResult(keys);
  } else if (typeof options.end !== 'undefined') {
    setResult(result.slice(begin, options.end));
  } else if (options.limit) {
    setResult(result.slice(begin, begin + options.limit));
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
      getInitialState({
        // TODO: figure out how to pass a store to handleQuery
        store: { key },
        reducerKey,
        setState: state => {
          item[reducerKey] = state;
        }
      });
    }
  }

  setResult(result);
}

const memoryReplicator = {
  getInitialState, onStateChange, handleQuery
};

export default memoryReplicator;
