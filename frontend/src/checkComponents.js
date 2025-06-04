/**
 * Component and Context Verification Script
 * This script checks if all components and contexts are properly connected
 */

import React from 'react';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { TicketProvider } from './context/TicketContext';
import { VoiceProvider } from './context/VoiceContext';
import Sidebar from './components/Sidebar';
import LanguageToggle from './components/LanguageToggle';
import LandingPage from './components/LandingPage';
import VoiceRecorder from './components/VoiceRecorder';
import ManualForm from './components/ManualForm';
import DraftTicketList from './components/DraftTicketList';
import DraftTicketView from './components/DraftTicketView';
import JobTicketForm from './components/JobTicketForm';
import translations from './translations';

// Check if all components are imported successfully
const componentsCheck = {
  App: !!App,
  LanguageProvider: !!LanguageProvider,
  TicketProvider: !!TicketProvider,
  VoiceProvider: !!VoiceProvider,
  Sidebar: !!Sidebar,
  LanguageToggle: !!LanguageToggle,
  LandingPage: !!LandingPage,
  VoiceRecorder: !!VoiceRecorder,
  ManualForm: !!ManualForm,
  DraftTicketList: !!DraftTicketList,
  DraftTicketView: !!DraftTicketView,
  JobTicketForm: !!JobTicketForm
};

// Check if translations are available
const translationsCheck = {
  english: !!translations.en,
  spanish: !!translations.es,
  englishFields: Object.keys(translations.en || {}).length,
  spanishFields: Object.keys(translations.es || {}).length
};

console.log('Components Check:', componentsCheck);
console.log('Translations Check:', translationsCheck);

// Export the check results for potential use
export const componentVerification = {
  components: componentsCheck,
  translations: translationsCheck,
  allComponentsLoaded: Object.values(componentsCheck).every(Boolean),
  translationsAvailable: !!translations.en && !!translations.es
};

export default componentVerification;
