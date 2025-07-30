import * as React from 'react';

// Extend the React global namespace to include internal properties
declare module 'react' {
  namespace React {
    // Add the internal property that React uses for hooks
    const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
      ReactCurrentDispatcher: any;
      ReactCurrentOwner: any;
      ReactCurrentBatchConfig: any;
      [key: string]: any;
    };
  }
}
