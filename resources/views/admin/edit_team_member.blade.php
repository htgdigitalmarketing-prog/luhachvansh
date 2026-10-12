@extends('admin.layout')

@section('content')

<?php

    // $professor=$doctor=$engineer=$lawyer=$ca=$corporates=$military=$civil_services=$politician="";

    // switch ("$get_info->profession") {
    //     case 'Professor':
    //         $professor="selected";
    //         break;
        
    //     case 'Doctor':
    //         $doctor="selected";
    //         break;
        
    //     case 'Engineer':
    //         $engineer="selected";
    //         break;
        
    //     case 'Lawyer':
    //         $lawyer="selected";
    //         break;
        
    //     case 'CA':
    //         $ca="selected";
    //         break;

    //     case 'Corporates':
    //         $corporates="selected";
    //         break;
        
    //     case 'Military':
    //         $military="selected";
    //         break;
        
    //     case 'Civil Services':
    //         $civil_services="selected";
    //         break;

    //     case 'Politician':
    //         $politician="selected";
    //         break;
        
    //     default:
            
    //         break;
    // }

?>


    <div class="card">
    <div class="card-header"><strong>Add Team Member</strong></div>
    <div class="card-body">
    <form class="form-group" action="{{route("store_edit_team_member")}}" method="post" enctype="multipart/form-data">
        @csrf

        <input type="hidden" name="id" value="{{$get_info->id}}">
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" value="{{$get_info->name}}" >
            </div>
            
            <div class="form-group col-md-4" id="father_name">
            <label class="mx-1" for="phone">Phone No.</label>
            <input type="number" class="form-control" name="phone" maxlength="10" type="text" placeholder="Phone Number"  value="{{$get_info->phone}}" >
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            {{-- <div class="form-group col-md-6">
            <label class="mx-1" for="profession">Profession</label>
            <select name="profession" class="form-control" id="profession">
                <option value="" hidden class="form-control ">Your profession</option>
                <option value="Professor" {{$professor}} class="form-control ">Professor</option>
                <option value="Doctor" {{$doctor}}  class="form-control ">Doctor</option>
                <option value="Engineer" {{$engineer}}  class="form-control ">Engineer</option>
                <option value="Lawyer" {{$lawyer}}  class="form-control ">Lawyer</option>
                <option value="CA" {{$ca}}  class="form-control ">CA's</option>
                <option value="Corporates" {{$corporates}}  class="form-control ">Corporates</option>
                <option value="Military" {{$military}}  class="form-control ">Military</option>
                <option value="Civil Services" {{$civil_services}}  class="form-control ">Civil Services</option>
                <option value="Politician" {{$politician}}  class="form-control ">Politician</option>
            </select>
            </div> --}}

            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="village">Village Name</label>
            <input type="text" class="form-control" name="village" type="text" placeholder="Village Name" value="{{$get_info->village}}" >
            </div>

            <div class="form-group col-md-4" id="father_name">
            <label class="mx-1" for="village">District</label>
            <input type="text" class="form-control" name="profession" type="text" placeholder="District" value="{{$get_info->profession}}" >
            </div>
        

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="post">Post</label>
            <input class="form-control" name="post" id="post" type="text" placeholder="Post" value="{{$get_info->post}}" >
            </div>
            
        </div>

        <button class="btn btn-sm btn-primary" type="submit"> Submit</button>
    </form>
    </div>
    <div class="card-footer">
    {{-- <button class="btn btn-sm btn-danger" type="reset"> Reset</button> --}}
    </div>
    </div>
    </div>

@endsection