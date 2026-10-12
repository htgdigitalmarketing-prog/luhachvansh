<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [AdminController::class,'home'])->name('home');

Route::get('/evolution', [AdminController::class,'evolution'])->name('evolution');

Route::get('/history', [AdminController::class,'history'])->name('history');
Route::get('/privacy-policy', [AdminController::class,'privacyPolicy'])->name('privacy-policy');

Route::get('/terms-conditions', [AdminController::class,'termsConditions'])->name('terms-conditions');

Route::get('/memories', [AdminController::class,'memories'])->name('memories');

Route::get('/about', [AdminController::class,'about'])->name('about');

Route::get('/kuldevi', [AdminController::class,'kuldevi'])->name('kuldevi');

Route::get('/news_details/{id}', [AdminController::class,'get_news'])->name('get_news');


Route::get('/team', [AdminController::class,'team'])->name('team');

Route::get('/join', [AdminController::class,'join'])->name('join');

Route::get('/achievers/{id}', [AdminController::class,'achievers'])->name('achievers');

Route::get('/shaheed', [AdminController::class,'shaheed'])->name('shaheed');

Route::get('/search/state/{id}', [AdminController::class,'searchstate'])->name('searchstate');

Route::get('/search/city/{id}', [AdminController::class,'searchcity'])->name('searchcity');

Route::get('/search/district/{id}', [AdminController::class,'searchdistrict'])->name('searchdistrict');

Route::post('/search', [AdminController::class,'search'])->name('search');

Route::get('/present', [AdminController::class,'present'])->name('present');

Route::get('/state/{id}', [AdminController::class,'searchstate']);

Route::get('/district/{id}', [AdminController::class,'searchdistrict']);

Route::get('/city/{id}', [AdminController::class,'searchcity']);

Route::post('/store_joinus', [AdminController::class,'store_joinus'])->name('store_joinus');


Route::middleware(['auth:sanctum', 'verified'])->get('/dashboard', [AdminController::class,'dashboard'] )->name('dashboard');

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    ///////// routes for news section ///////////

    Route::get('/news', [AdminController::class,'news'])->name('news');
    Route::post('/news/store', [AdminController::class,'store_news'])->name('store_news');
    Route::get('/news/delete/{id}', [AdminController::class,'delete_news'])->name('delete_news');
    Route::get('/news/update/{id}', [AdminController::class,'update_news'])->name('update_news');
    Route::post('/news/update/store/{id}', [AdminController::class,'update_store_news'])->name('update_store_news');


    ///////// routes for about section ///////////

    Route::get('/aboutus', [AdminController::class,'aboutus'])->name('aboutus');
    Route::post('/aboutus/update', [AdminController::class,'update_aboutus'])->name('update_aboutus');

    ///////// routes for kuldevi section ///////////

    Route::get('/devi', [AdminController::class,'devi'])->name('devi');
    Route::post('/devi/update', [AdminController::class,'update_devi'])->name('update_devi');

    ///////// routes for history section ///////////

    Route::get('/hist', [AdminController::class,'hist'])->name('hist');
    Route::post('/hist/update', [AdminController::class,'update_hist'])->name('update_hist');


    ///////// routes for gallery section ///////////

    Route::get('/gallery', [AdminController::class,'gallery'])->name('gallery');
    Route::post('/gallery/store', [AdminController::class,'store_gallery'])->name('store_gallery');
    Route::get('/gallery/delete/{id}', [AdminController::class,'delete_gallery'])->name('delete_gallery');
    Route::get('/gallery/slider/{id}', [AdminController::class,'slider_gallery'])->name('slider_gallery');

    ///////// routes for join us section ///////////

    Route::get('/join_us', [AdminController::class,'join_us'])->name('join_us');
    Route::get('/join_us/delete/{id}', [AdminController::class,'delete_join_us'])->name('delete_join_us');
    Route::get('/join_us/approve/{id}', [AdminController::class,'approve_join_us'])->name('approve_join_us');

    ///////// routes for member section ///////////

    Route::get('/add_member', [AdminController::class,'add_member'])->name('add_member');
    Route::post('/store_member', [AdminController::class,'store_member'])->name('store_member');
    Route::post('/store_edit_member', [AdminController::class,'store_edit_member'])->name('store_edit_member');
    Route::get('/all_member', [AdminController::class,'all_member'])->name('all_member');
    Route::get('/all_member/delete/{id}', [AdminController::class,'delete_member'])->name('delete_member');
    Route::get('/all_member/edit/{id}', [AdminController::class,'edit_member'])->name('edit_member');

    ///////// routes for team member section ///////////

    Route::get('/add_team_member', [AdminController::class,'add_team_member'])->name('add_team_member');
    Route::post('/store_team_member', [AdminController::class,'store_team_member'])->name('store_team_member');
    Route::post('/store_edit_team_member', [AdminController::class,'store_edit_team_member'])->name('store_edit_team_member');
    Route::get('/all_team_member', [AdminController::class,'all_team_member'])->name('all_team_member');
    Route::get('/all_team_member/delete/{id}', [AdminController::class,'delete_team_member'])->name('delete_team_member');
    Route::get('/all_team_member/edit/{id}', [AdminController::class,'edit_team_member'])->name('edit_team_member');

    ///////// routes for village section ///////////

    Route::get('/village', [AdminController::class,'village'])->name('village');
    Route::get('/village/update/{id}', [AdminController::class,'village_update'])->name('village_update');
    Route::post('/village/update/store', [AdminController::class,'village_update_store'])->name('village_update_store');

     ///////// routes for village gallery section ///////////

    Route::get('/village/gallery/{id}', [AdminController::class,'village_gallery'])->name('village_gallery');
    Route::post('store/village/gallery', [AdminController::class,'store_village_gallery'])->name('store_village_gallery');
    Route::get('village/gallery/delete/{id}', [AdminController::class,'delete_village_gallery'])->name('delete_village_gallery');


     ///////// routes for shaheed section ///////////

     Route::get('/add_shaheed', [AdminController::class,'add_shaheed'])->name('add_shaheed');
     Route::post('/store_shaheed', [AdminController::class,'store_shaheed'])->name('store_shaheed');
     Route::post('/store_edit_shaheed', [AdminController::class,'store_edit_shaheed'])->name('store_edit_shaheed');
     Route::get('/all_shaheed', [AdminController::class,'all_shaheed'])->name('all_shaheed');
     Route::get('/all_shaheed/delete/{id}', [AdminController::class,'delete_shaheed'])->name('delete_shaheed');
     Route::get('/all_shaheed/edit/{id}', [AdminController::class,'edit_shaheed'])->name('edit_shaheed');
 


    ///////// routes for logout ///////////
    Route::get('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});


////AJAX STATE DISTRICT VILLAGE DATA start//////
Route::post('state', [AdminController::class, 'getDistrict'])->name('admin.getdistrict');
Route::post('districtname', [AdminController::class, 'getVillage'])->name('admin.getvillage');

////AJAX STATE DISTRICT VILLAGE DATA start//////


