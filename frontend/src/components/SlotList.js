import React from 'react';

export default function SlotList({messages}){
  return (
    <div>
      <h4>Recent updates</h4>
      <div style={{maxHeight: '70vh', overflow: 'auto'}}>
        {messages.map((m, i) => (
          <div key={i} style={{padding:6, borderBottom: '1px solid #eee'}}>
            <pre style={{margin:0}}>{JSON.stringify(m)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
