import React, { useReducer, useEffect } from "react";

import ActiveFileDetails from "./ActiveFileDetails";
import DisplayOptions from "./DisplayOptions";
import ScatterPlot from "./ScatterPlot";
import reducer from "../reducers/chartReducer";

export const RegressionTypes = {
  POWER_LAW: 0,
  LINEAR: 1
};

const initialState = {
  displayRegression: false,
  displayFilenames: false,
  regressionType: RegressionTypes.POWER_LAW,
  values: [],
  filePrefix: "",
  path: "",
  activeFile: {}
};

const Chart = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchValues = async () => {
    const data = await (await fetch(`/values`)).json();

    return data;
  };

  const fetchFilePrefix = async () => {
    const data = await (await fetch("/file_prefix")).json();

    return data;
  };

  function fileClickCallback(data) {
    dispatch({ type: "SET_ACTIVE_FILE", activeFile: data });
  }

  useEffect(() => {
    (async () => {
      const [values, filePrefix] = await Promise.all([
        fetchValues(),
        fetchFilePrefix()
      ]);

      dispatch({ type: "SET_VALUES", values });

      if (filePrefix["file_prefix"]) {
        dispatch({
          type: "SET_FILE_PREFIX",
          filePrefix: filePrefix["file_prefix"]
        });
      }
    })();
  }, []);

  const handlePathChange = e => {
    dispatch({
      type: "SET_PATH",
      path: e.target.value
    });
  };

  return (
    <div className="row">
      <div
        className={
          !state.activeFile || Object.keys(state.activeFile).length === 0
            ? "col-12"
            : "col-8"
        }
      >
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Churn vs Complexity</h5>
            <h6 className="text-muted">
              Click on a point for additional information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-2 col-lg-3" />
              <div className="col-8 col-lg-6">
                <div id="path-input-group">
                  <label htmlFor="path" className="text-muted">
                    <small>Base Path</small>
                  </label>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="path-text">
                        {`./${state.filePrefix || ""}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=""
                      aria-label=""
                      aria-describedby="path-text"
                      id="path"
                      value={state.path}
                      onChange={handlePathChange}
                    />
                  </div>
                </div>
              </div>
              <div className="col-2 col-lg-3" />
            </div>
            <div className="d-flex justify-items-center" id="canvas-wrapper">
              <ScatterPlot fileClickCallback={fileClickCallback} {...state} />
            </div>
            <DisplayOptions state={state} dispatch={dispatch} />
          </div>
        </div>
      </div>
      {state.activeFile && Object.keys(state.activeFile).length > 0 && (
        <ActiveFileDetails
          activeFile={state.activeFile}
          handleClose={() => {
            dispatch({
              type: "SET_ACTIVE_FILE",
              activeFile: {}
            });
          }}
        />
      )}
    </div>
  );
};

export default Chart;
