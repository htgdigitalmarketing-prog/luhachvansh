<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
// use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class AdminController extends Controller
{
    public function home(){

        $get_news=DB::table('news')
            ->select('id','news','news_title')
            ->orderBy('create_at','desc')
            ->get();

        $get_slider=DB::table('gallery')
            ->select('images')
            ->where('is_slider',1)
            ->orderBy('create_at','desc')
            ->get();

        $get_gallery=DB::table('gallery')
            ->select('images')
            ->where('is_slider',0)
            ->orderBy('create_at','desc')
            ->get();
            

        return view('home', compact('get_news','get_slider','get_gallery'));

    }

    public function evolution(){

        return view('evolution');

    }

    public function about(){

        return view('about');

    }
    
    public function privacyPolicy(){

        return view('privacy-policy');

    }
    
    public function termsConditions(){

        return view('terms-conditions');

    }
    
    public function kuldevi(){

        return view('kuldevi');

    }


    public function team(){

        
        $get_data=DB::table('team')
        ->orderBy('create_at','desc')
        ->get();

        return view('team',compact('get_data'));

    }

    public function memories(){

        $get_gallery=DB::table('gallery')
            ->select('images')
            ->where('is_slider',0)
            ->orderBy('create_at','desc')
            ->get();

        return view('memories',compact('get_gallery'));

    }


    public function history(){

        $get_history=DB::table('history')
            ->first();

        return view('history',compact('get_history'));

    }

    public function get_news($id){

        
        $get_data=DB::table('news')
        ->where('id',$id)
        ->first();

        return view('news',compact('get_data'));

    }



    public function join(){

        return view('join');

    }

    public function achievers(Request $request){

        if($request->id=="all"){

        $get_data=DB::table('members')
        ->where('achievements', '!=' ,null)
        ->get();

        return view('achievers',compact('get_data'));

        }else{

        $get_data=DB::table('members')
        ->where('profession',$request->id)
        ->get();

        return view('achievers',compact('get_data'));

        }
        

    }

    public function search(Request $request){
        $option = $request->search_by;
        $search = $request->search_term;


        $get_search=DB::table('members')
            ->where($option,$search)
            ->get();

        return view('search', compact('get_search'));

    }


    public function present(){

        $haryana_count=DB::table('members')
            ->where('state',"Haryana")
            ->count();

        $rajasthan_count=DB::table('members')
            ->where('state',"Rajasthan")
            ->count();


        $uttarpradesh_count=DB::table('members')
            ->where('state',"UttarPradesh")
            ->count();
            
        
        return view('present',compact('haryana_count','rajasthan_count','uttarpradesh_count'));

    }


    public function searchstate($id){

        $get_search=DB::table('members')
            ->where('state',$id)
            ->get();

        $get_village=DB::table('village')
            ->where('village',$id)
            ->first();

        return view('search', compact('get_search','get_village'));

    }

    public function searchdistrict($id){

        $get_search=DB::table('members')
            ->where('current_district',$id)
            ->get();

        $get_village=DB::table('village')
            ->where('village',$id)
            ->first();

        return view('search', compact('get_search','get_village'));

    }

    public function searchcity($id){

        $get_search=DB::table('members')
            ->where('current_city',$id)
            ->get();

        $get_village=DB::table('village')
            ->where('village',$id)
            ->first();

        $get_gallery=DB::table('village_gallery')
            ->where('village',$id)
            ->get();

        $first_person_of_village=DB::table('members')
            ->where('first_person_of_village',$id)
            ->first();

        $route = Route::currentRouteName();
            
        return view('search', compact('get_search','get_village','get_gallery','route','first_person_of_village'));

    }

    public function dashboard(){

        $members_count=DB::table('members')
        ->count();

        $join_us_count=DB::table('join_us')
        ->count();

        $gallery_count=DB::table('gallery')
        ->count();

        $news_count=DB::table('news')
        ->count();


        return view('admin.dashboard',compact('members_count','join_us_count','gallery_count','news_count'));

    }


    public function news(){
        $get_news=DB::table('news')
        ->select('id','news','news_title')
        ->orderBy('create_at','desc')
        ->get();

        return view('admin.news',compact('get_news'));
    }

    public function store_news(Request $request){
        $data=array();
        $data['news']=$request->news;
        $data['news_title']=$request->news_title;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('news')
            ->insert($data);

        return redirect()->route('news');
    }

    public function update_news($id){

        $get_news=DB::table('news')
        ->where('id',$id)
        ->select('id','news','news_title')
        ->first();

        return view('admin.news_update',compact('get_news'));
    }

    public function update_store_news(Request $request,$id){
        $data=array();
        $data['news']=$request->news;
        $data['news_title']=$request->news_title;
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('news')
            ->where('id',$id)
            ->update($data);

        return redirect()->route('news');
    }


    public function delete_news(Request $request,$id){

        $store_news=DB::table('news')
            ->where('id',$id)
            ->delete();

        return redirect()->route('news');
        
    }


    public function gallery(){
        $get_gallery=DB::table('gallery')
        ->select('id','images','is_slider')
        ->orderBy('create_at','desc')
        ->get();

        return view('admin.gallery',compact('get_gallery'));
    }

    public function store_gallery(Request $request){
       
        if($request->slider==null){
            $slider=0;
        }else{
            $slider=1;
        }

        $data=array();

        
        $image_one = $request->images;
        $image_name = date('dmy_H_s_i');
 	    $ext = strtolower($image_one->getClientOriginalExtension());
 	    $image_full_name = $image_name.'.'.$ext;
 	    $upload_path = 'frontend/img/gallery/';
 	    $image_url = $upload_path.$image_full_name;
 	    $success = $image_one->move($upload_path,$image_full_name);

        $data['images']=$image_url;
        $data['is_slider']=$slider;
        $data['create_at']=Carbon::now('Asia/Kolkata');
        
        $store_gallery=DB::table('gallery')
            ->insert($data);

        return redirect()->route('gallery');
    }

    public function delete_gallery(Request $request,$id){

        $store_news=DB::table('gallery')
            ->where('id',$id)
            ->delete();

        return redirect()->route('gallery');
        
    }

    public function slider_gallery(Request $request,$id){

        $slider_gallery=DB::table('gallery')
            ->where('id',$id)
            ->first('is_slider');

        if($slider_gallery->is_slider==0){
            $slider_gallery=DB::table('gallery')
            ->where('id',$id)
            ->update(['is_slider'=>1]);
        }else{
            $slider_gallery=DB::table('gallery')
            ->where('id',$id)
            ->update(['is_slider'=>0]);
        }

        return redirect()->route('gallery');
        
    }

    public function store_joinus(Request $request){

        $data=array();
        $data['name']=$request->name;
        $data['father_name']=$request->father;
        $data['age']=$request->age;
        $data['profession']=$request->profession;
        $data['contact_number']=$request->phone;
        $data['email']=$request->email;
        $data['subject']=$request->subject;
        $data['message']=$request->message;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $store_join_us=DB::table('join_us')
            ->insert($data);

        return redirect()->route('join');
        
    }


    public function join_us(){
        $get_join_us=DB::table('join_us')
        ->where('is_approved',0)
        ->orderBy('create_at','desc')
        ->get();

        return view('admin.joinus',compact('get_join_us'));
    }


    public function delete_join_us(Request $request,$id){

        $store_news=DB::table('join_us')
            ->where('id',$id)
            ->delete();

        return redirect()->route('join_us');
        
    }

    public function approve_join_us(Request $request,$id){

        $get_join=DB::table('join_us')
            ->where('id',$id)
            ->first();

        $data = array();
        $data['name']=$get_join->name;         
        $data['profession']=$get_join->profession;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $insert_member=DB::table('members')
            ->insert($data);

        if($insert_member){

            $update_join=DB::table('join_us')
            ->where('id',$id)
            ->update(['is_approved'=>1]);

        }

        return redirect()->route('join_us');
        
    }

    public function add_member(){
        
        

        $get_fathers=DB::table('members')
        ->orderBy('create_at','desc')
        ->select('id','name','father_id')
        ->get();


        return view('admin.add_member',compact('get_fathers'));

    }

    public function edit_member($id){

        $get_fathers=DB::table('members')
        ->orderBy('create_at','desc')
        ->select('id','name','father_id')
        ->get();

        $get_info=DB::table('members')
        ->where('id',$id)
        ->first();

        

        return view('admin.edit_member',compact('get_info','get_fathers'));

    }

    public function store_member(Request $request){

        $data=array();
        $data['name']=$request->name;
        if($request->is_father){

            $get_fathers=DB::table('members')
            ->where('id',$request->father_select)
            ->select('id','name')
            ->first();

            $data['father_name']=$get_fathers->name;
            $data['father_id']=$get_fathers->id;

        }else{

            $data['father_name']=$request->father_name;
            $data['father_id']=9999;

        }

        if(isset($request->photo)){

        $image_one = $request->photo;
        $image_name = date('dmy_H_s_i');
 	    $ext = strtolower($image_one->getClientOriginalExtension());
 	    $image_full_name = $image_name.'.'.$ext;
 	    $upload_path = 'frontend/img/gallery/';
 	    $image_url = $upload_path.$image_full_name;
 	    $success = $image_one->move($upload_path,$image_full_name);
         
        $data['photo']=$image_url;
        
        }
        $district = DB::table('district')->where('id', $request->district)->first();
       
        $data['current_district']=$district->district;
        $data['profession']=$request->profession;
        $data['belong_from']=$request->belong_from;

        $village_name = DB::table('only_village')->where('id', $request->current_city)->first();

        $data['birth_place']=$village_name->village;
        $data['current_city']=$village_name->village;
        $data['achievements']=$request->achievements;

        if($request->state == "1"){
            $data['state']="Haryana";
        }
        elseif($request->state == "2"){
            $data['state']="Rajasthan";
        }else{
            $data['state']="UttarPradesh";
        }
        
        $data['first_person_of_village']=$request->first_person_village;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $store_members=DB::table('members')
            ->insertGetId($data);


        $store_village=DB::table('village')
            ->upsert(
                ['state'=>$data['state'],'district'=>$district->district,'village'=>$village_name->village],
                ['state'=>$data['state'],'district'=>$district->district,'village'=>$village_name->village],
                ['state','district'],['village']
            );

        return redirect()->route('add_member');

    }


    public function store_edit_member(Request $request){

        $id=$request->id;
        $data=array();
        $data['name']=$request->name;
        if($request->is_father){

            $get_fathers=DB::table('members')
            ->where('id',$request->father_select)
            ->select('id','name')
            ->first();

            $data['father_name']=$get_fathers->name;
            $data['father_id']=$get_fathers->id;

        }else{

            $data['father_name']=$request->father_name;
            $data['father_id']=9999;

        }

        if(isset($request->photo)){

        $image_one = $request->photo;
        $image_name = date('dmy_H_s_i');
 	    $ext = strtolower($image_one->getClientOriginalExtension());
 	    $image_full_name = $image_name.'.'.$ext;
 	    $upload_path = 'frontend/img/gallery/';
 	    $image_url = $upload_path.$image_full_name;
 	    $success = $image_one->move($upload_path,$image_full_name);
         
        $data['photo']=$image_url;

        }

        
        $data['current_district']=$request->district;
        $data['profession']=$request->profession;
        $data['belong_from']=$request->belong_from;
        $data['birth_place']=$request->birth_place;
        $data['current_city']=$request->current_city;
        $data['achievements']=$request->achievements;
        $data['state']=$request->state;
        $data['first_person_of_village']=$request->first_person_of_village;
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_members=DB::table('members')
            ->where('id',$id)
            ->update($data);

            $store_village=DB::table('village')
            ->upsert(
                ['state'=>$request->state,'district'=>$request->district,'village'=>$request->current_city],
                ['state'=>$request->state,'district'=>$request->district,'village'=>$request->current_city],
                ['state','district'],['village']
            );

        return redirect()->route('all_member');

    }


    public function all_member(){

        $get_data=DB::table('members')
        ->orderBy('create_at','desc')
        ->get();


        return view('admin.all_member',compact('get_data'));

    }

    public function delete_member(Request $request,$id){

        $store_news=DB::table('members')
            ->where('id',$id)
            ->delete();

        return redirect()->route('all_member');
        
    }




    public function aboutus(){

        $get_about=DB::table('about')
        ->select('para','image_one_path','image_two_path')
        ->first();

        return view('admin.aboutus',compact('get_about'));
    }

    public function update_aboutus(Request $request){

        $data=array();

        if(isset($request->para)){

            $data['para']=$request->para;

        }

        if(isset($request->image_one)){

            $image_one = $request->image_one;
            $image_name = 'image_one';
            $ext = strtolower($image_one->getClientOriginalExtension());
            $image_full_name = $image_name.'.'.$ext;
            $upload_path = 'frontend/img/about/';
            $image_url = $upload_path.$image_full_name;
            $success = $image_one->move($upload_path,$image_full_name);
                
            $data['image_one_path']=$image_url;

        }

        if(isset($request->image_two)){

            $image_one = $request->image_two;
            $image_name = 'image_two';
            $ext = strtolower($image_one->getClientOriginalExtension());
            $image_full_name = $image_name.'.'.$ext;
            $upload_path = 'frontend/img/about/';
            $image_url = $upload_path.$image_full_name;
            $success = $image_one->move($upload_path,$image_full_name);
            
            $data['image_two_path']=$image_url;

        }
        
       
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('about')
            ->where('id',1)
            ->update($data);

        return redirect()->route('aboutus');
    }



    public function hist(){

        $get_hist=DB::table('history')
        ->first();

        return view('admin.history',compact('get_hist'));
    }

    public function update_hist(Request $request){

        $data=array();

        if(isset($request->history)){

            $data['history']=$request->history;

        }

        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('history')
            ->where('id',1)
            ->update($data);

        return redirect()->route('hist');
    }


    public function add_team_member(){

        return view('admin.add_team_member');

    }

    public function edit_team_member($id){

        $get_info=DB::table('team')
        ->where('id',$id)
        ->first();

        return view('admin.edit_team_member',compact('get_info'));

    }

    public function store_team_member(Request $request){

        $data=array();
        $data['name']=$request->name;
        $data['profession']=$request->profession;
        $data['phone']=$request->phone;
        $data['post']=$request->post;
        $data['village']=$request->village;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $store_members=DB::table('team')
            ->insertGetId($data);

        return redirect()->route('add_team_member');

    }


    public function store_edit_team_member(Request $request){

        $id=$request->id;
        $data=array();
        $data['name']=$request->name;
        $data['profession']=$request->profession;
        $data['phone']=$request->phone;
        $data['post']=$request->post;
        $data['village']=$request->village;
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_members=DB::table('team')
            ->where('id',$id)
            ->update($data);

        return redirect()->route('all_team_member');

    }


    public function all_team_member(){

        $get_data=DB::table('team')
        ->orderBy('create_at','desc')
        ->get();


        return view('admin.all_team_member',compact('get_data'));

    }

    public function delete_team_member(Request $request,$id){

        $store_news=DB::table('team')
            ->where('id',$id)
            ->delete();

        return redirect()->route('all_team_member');
        
    }


    public function village(){

        $get_data=DB::table('village')
            ->get();
        return view('admin.village',compact('get_data'));

    }


    public function village_update($id){

        $get_data=DB::table('village')
            ->where('id',$id)
            ->first();


        return view('admin.village_update',compact('get_data'));

    }


    public function village_update_store(Request $request){
        
        $data=array();
        $data['description']=$request->description;

        if(isset($request->pdf)){
        $imageName = time().'.'.$request->pdf->extension();  
        $image_url = 'frontend/img/village/'.$imageName;

        $request->pdf->move(public_path('frontend/img/village/'), $imageName);   
        $data['pdf_file']=$image_url;

        }

        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('village')
            ->where('id',$request->id)
            ->update($data);

        $store_new=DB::table('village')
            ->where('id',$request->id)
            ->first();
        
        $store=DB::table('village_gallery')
            ->insert(['village_id'=> $store_new->id,'state'=>$store_new->state,'district'=>$store_new->district,'village'=>$store_new->village]);

        return redirect()->route('village');
    }


    public function village_gallery($id){

        $get_gallery=DB::table('village_gallery')
            ->where('village_id',$id)
            ->get();


        $get_data=DB::table('village_gallery')
            ->where('village_id',$id)
            ->first();

    return view('admin.village_gallery',compact('get_gallery','get_data'));
    }


    public function store_village_gallery (Request $request){

        $data=array();

        
     $imageName = time().'.'.$request->images->extension();  
     
     $image_url = 'frontend/img/village/'.$imageName;
     
        $request->images->move(public_path('frontend/img/village/'), $imageName);   
     
        $data['image_path']=$image_url;
        $data['state']=$request->state;
        $data['district']=$request->district;
        $data['village']=$request->village;
        $data['village_id']=$request->id;

        DB::table('village_gallery')->insert($data);

        return redirect()->back();

    }


    public function delete_village_gallery($id){

        $get_gallery=DB::table('village_gallery')
            ->where('id',$id)
            ->delete();

        return redirect()->back();
    }


    public function add_shaheed(){

        return view('admin.add_shaheed');

    }


    public function store_shaheed(Request $request){

        $data= array();
        $data['name']=$request->name;
        $data['father_name']=$request->father_name;
        $data['unit']=$request->unit;
        $data['village']=$request->village;
        $data['district']=$request->district;
        $data['state']=$request->state;
        $data['military_status']=$request->military_status;
        $data['post']=$request->post;
        $data['army_no']=$request->army_no;
        $data['operation']=$request->operation;
        $data['operation_sr_no']=$request->operation_sr_no;
        $data['create_at']=Carbon::now('Asia/Kolkata');

        $store_shaheed = DB::table('shaheed')
            ->insert($data);

        return redirect()->back();

    }


    public function all_shaheed(){

        $get_data=DB::table('shaheed')
            ->get();

        return view('admin.all_shaheed',compact('get_data'));

    }

    public function edit_shaheed($id){

        $get_info=DB::table('shaheed')
            ->where('id',$id)
            ->first();

        return view('admin.edit_shaheed',compact('get_info'));

    }

    public function store_edit_shaheed(Request $request){

        $data= array();
        $data['name']=$request->name;
        $data['father_name']=$request->father_name;
        $data['unit']=$request->unit;
        $data['village']=$request->village;
        $data['district']=$request->district;
        $data['state']=$request->state;
        $data['military_status']=$request->military_status;
        $data['post']=$request->post;
        $data['army_no']=$request->army_no;
        $data['operation']=$request->operation;
        $data['operation_sr_no']=$request->operation_sr_no;
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_shaheed = DB::table('shaheed')
            ->where('id',$request->id)
            ->update($data);

        return redirect()->route('all_shaheed');

    }

    public function delete_shaheed($id){

        $store_shaheed = DB::table('shaheed')
            ->where('id',$id)
            ->delete();

        return redirect()->route('all_shaheed');

    }

    public function shaheed(){

        $get_data=DB::table('shaheed')
        ->get();

        return view('shaheed',compact('get_data'));
        

    }




    public function devi(){

        $get_devi=DB::table('about')
        ->where('id',2)
        ->select('para','image_one_path','image_two_path')
        ->first();

        return view('admin.devi',compact('get_devi'));
    }

    public function update_devi(Request $request){

        $data=array();

        if(isset($request->para)){

            $data['para']=$request->para;

        }

        if(isset($request->image_one)){

            $image_one = $request->image_one;
            $image_name = 'image_on';
            $ext = strtolower($image_one->getClientOriginalExtension());
            $image_full_name = $image_name.'.'.$ext;
            $upload_path = 'frontend/img/about/';
            $image_url = $upload_path.$image_full_name;
            $success = $image_one->move($upload_path,$image_full_name);
                
            $data['image_one_path']=$image_url;

        }

        if(isset($request->image_two)){

            $image_one = $request->image_two;
            $image_name = 'image_tw';
            $ext = strtolower($image_one->getClientOriginalExtension());
            $image_full_name = $image_name.'.'.$ext;
            $upload_path = 'frontend/img/about/';
            $image_url = $upload_path.$image_full_name;
            $success = $image_one->move($upload_path,$image_full_name);
            
            $data['image_two_path']=$image_url;

        }
        
       
        $data['update_at']=Carbon::now('Asia/Kolkata');

        $store_news=DB::table('about')
            ->where('id',2)
            ->update($data);

        return redirect()->route('devi');
    }

    public function getDistrict(Request $request){

        $districtdata = DB::table('district')->where('state_name', $request->get('state_name'))->get();
       
        return response()->json(['districtdata' => $districtdata]);
    }

    public function getVillage(Request $request){
        $id = $request->get('district');
        $village_data = DB::table('only_village')->where('district', $id)->get();
        
        return response()->json(['village_data' => $village_data]);


    }
}
