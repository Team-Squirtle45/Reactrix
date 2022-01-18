import React, { useState, useEffect, useMemo, Profiler } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { ThemeProvider } from '@material-ui/core';
import { theme } from './styles/theme';

import './styles/styles.css';

import Main from './containers/Main';
import SignIn from './components/SignIn';
import Demo from './prototype/Demo';
import ComponentTree from './containers/ComponentTree';
import { UserContext } from './contexts/UserContext';
import { useAppDispatch } from './hooks';
import { isAnyOf } from '@reduxjs/toolkit';

const App = () => {
  const [user, setUser] = useState(null);
  const [reusableComponents, setReusableComponents] = useState([]);

  const providerUser = useMemo(() => ({ user, setUser, reusableComponents, setReusableComponents }), [user, setUser, reusableComponents, setReusableComponents]);

  useEffect( () => {
    const getUser = async () => {
      await fetch('/auth/login/success', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        }
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error('authentication has been failed!');
        })
        .then((resObject) => {
          console.log('App.tsx, line 41', resObject);
          setUser(resObject);
          setReusableComponents(resObject.userReusableComponents);
        })
        .then((err) => {
          console.log('error from main page', err);
        });
    };
    getUser();
  }, []);

  useEffect(() => {
    // console.log('reusablecomponents useeffect')
    const insertReusableComponents = async () => {
      await fetch('/reusablecomponents/insert', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        },
        body:
          JSON.stringify({ reusableComponents: reusableComponents, user: user }),
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error('authentication has been failed!');
        })
        .then((err) => {
          console.log('error from main page', err);
        });
    };
    insertReusableComponents();
  }, [reusableComponents]);

  // const sendProfilerData = (
  //   id: string, // the "id" prop of the Profiler tree that has just committed
  //   phase: string, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  //   actualDuration: number, // time spent rendering the committed update
  //   baseDuration: number, // estimated time to render the entire subtree without memoization
  //   startTime: number, // when React began rendering this update
  //   commitTime: number // when React committed this update
  // ) => {
  //   // Aggregate or log render timings...
  //   // const dispatch = useAppDispatch();
  //   // dispatch({type: 'storeProfilerData', payload: {id, phase, actualDuration}});
  //   console.log('this is id', id);
  //   console.log('this is phase', phase);
  //   console.log('this is actualDuration', actualDuration);
  //   console.log('this is baseDuration', baseDuration);
  //   console.log('this is startTime', startTime);
  //   console.log('this is commitTime', commitTime);
  // };
  const dispatch = useAppDispatch();

  return (
    <Router>
      <UserContext.Provider value={providerUser}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
              <Route path="/dashboard" element={<Main />}>
                <Route index element={<ComponentTree />} />
                <Route
                  path="demo"
                  element={
                    <Profiler
                      id="Demo"
                      onRender={(id: string, phase: string, actualDuration: number) => {
                        dispatch({ type: 'profiler/storeProfilerData', payload: { id, phase, actualDuration } });
                      }}
                    >
                      <Demo />
                    </Profiler>
                  }
                />
              </Route>
            </Routes>
          </ThemeProvider>
        </DndProvider>
      </UserContext.Provider>
    </Router>
  );
};

export default hot(App);
