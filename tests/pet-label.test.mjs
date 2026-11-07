import test from 'node:test';
import assert from 'node:assert/strict';
import {petLabel} from '../widget/pet-label.js';
test('header names follow each family and stage without changing saved identity',()=>{
 assert.equal(petLabel('cyberpunk',{character:'babytchi',stage:'baby'}),'Bit · Baby');
 assert.equal(petLabel('slice',{character:'babytchi',stage:'baby'}),'Dough Drop · Baby');
 assert.equal(petLabel('default',{character:'mametchi',stage:'adult'}),'Mametchi · Adult');
 assert.equal(petLabel('default'),'Original · Egg');
 assert.equal(petLabel('cyberpunk',{character:'babytchi',stage:'baby',vacationAt:1}),'Bit · Baby · Paused');
});
