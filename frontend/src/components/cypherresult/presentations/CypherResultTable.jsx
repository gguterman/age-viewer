/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import CypherResultTab from '../../cytoscape/CypherResultTab';

// Stable uuid helper (no external/internal library paths). Uses crypto if available, else falls back.
const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    // clarify precedence with parentheses to satisfy eslint no-mixed-operators
    const v = c === 'x' ? r : ((r & 0x3) | 0x8); // eslint-disable-line no-bitwise
    return v.toString(16);
  });
};

const CypherResultTable = ({ data, ...props }) => {
  const [localColumns, setLocalColumns] = useState([]);
  const [localRows, setLocalRows] = useState([]);

  useEffect(() => {
    if (!data || !data.columns || !data.rows) return;

    const randKeyName = `key_${uuid()}`;
    let hasKey = false;

    // Build columns once per change in data.columns
    const derivedColumns = data.columns.map((col) => {
      const isKey = col === 'key';
      if (isKey) hasKey = true;
      return {
        title: col,
        dataIndex: isKey ? randKeyName : col,
        key: isKey ? randKeyName : col,
        render: (text) => <>{JSON.stringify(text)}</>,
      };
    });
    setLocalColumns(derivedColumns);

    // Optional filtering
    let workingRows = data.rows;
    if (props.filterTable?.length) {
      const filters = props.filterTable;
      workingRows = data.rows.filter((row) => (
        filters.some((filter) => {
          const propName = filter.property.property;
          const keyword = filter.keyword;
          const label = filter.property.label;
          const rMatch = (label === row.r?.label)
            && row.r?.properties?.[propName]?.includes?.(keyword);
          const vMatch = (label === row.v?.label)
            && row.v?.properties?.[propName]?.includes?.(keyword);
            // v2 matching (third element)
          const v2Match = (label === row.v2?.label)
            && row.v2?.properties?.[propName]?.includes?.(keyword);
          return rMatch || vMatch || v2Match;
        })
      ));
    }

    const mapped = workingRows.map((row) => {
      const copy = { ...row };
      if (hasKey && Object.prototype.hasOwnProperty.call(copy, 'key')) {
        copy[randKeyName] = copy.key;
        delete copy.key;
      }
      copy.key = uuid();
      return copy;
    });
    setLocalRows(mapped);
  }, [props.filterTable, data]);

  if (data.command && data.command.toUpperCase().match('(GRAPH|COPY|UPDATE).*')) {
    return (
      <div style={{ margin: '25px' }}>
        <span style={{ whiteSpace: 'pre-line' }}>
          <span>Successfully ran the query!</span>
        </span>
      </div>
    );
  }
  if (data.command && data.command.toUpperCase() === 'CREATE') {
    return (
      <div style={{ margin: '25px' }}>
        <span style={{ whiteSpace: 'pre-line' }}>
          {data.command.toUpperCase()}
        </span>
      </div>
    );
  }
  if (data.command && data.command.toUpperCase() === 'ERROR') {
    return (
      <div style={{ margin: '25px' }}>
        <span style={{ whiteSpace: 'pre-line' }}>
          {data.message}
        </span>
      </div>
    );
  }
  if (data.command === null) {
    return (
      <div style={{ margin: '25px' }}>
        <span style={{ whiteSpace: 'pre-line' }}>
          Query not entered!
        </span>
      </div>
    );
  }

  const { refKey, setIsTable } = props;
  return (
    <div className="legend-area">
      <div className="contianer-frame-tab">
        <div style={{ width: '80%', color: '#C4C4C4' }}>
          <div className="d-flex nodeLegend">Node:</div>
          <div className="d-flex edgeLegend">Edge:</div>
        </div>
        <CypherResultTab refKey={refKey} setIsTable={setIsTable} currentTab="table" />
      </div>
      <Table columns={localColumns} dataSource={localRows} />
    </div>
  );
};

CypherResultTable.propTypes = {
  data: PropTypes.shape({
    message: PropTypes.string,
    command: PropTypes.string,
    rowCount: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    columns: PropTypes.any,
    // eslint-disable-next-line react/forbid-prop-types
    rows: PropTypes.any,
    statusText: PropTypes.string,
  }).isRequired,
  refKey: PropTypes.string.isRequired,
  setIsTable: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  filterTable: PropTypes.any.isRequired,
};

export default CypherResultTable;
