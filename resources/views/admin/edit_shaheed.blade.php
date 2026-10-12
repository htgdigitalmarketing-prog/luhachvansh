@extends('admin.layout')

@section('content')

<?php

    $haryana=$uttar_pradesh=$rajasthan=$military=$paramilitary="";

    switch ("$get_info->state") {

        case 'Haryana':
            $haryana="selected";
            break;
        
        case 'Rajasthan':
            $rajasthan="selected";
            break;

        case 'UttarPradesh':
            $uttar_pradesh="selected";
            break;
        
        default:
            
            break;
    }

    switch ("$get_info->military_status") {

        case 'military':
            $military="selected";
            break;

        case 'paramiltary':
            $paramilitary="selected";
            break;

        default:
            
            break;
    }

?>


    <div class="card">
    <div class="card-header"><strong>Edit Shaheed</strong></div>
    <div class="card-body">
    <form class="form-group" action="{{route("store_edit_shaheed")}}" method="post" enctype="multipart/form-data">
        @csrf

        <input type="hidden" name="id" value="{{$get_info->id}}">
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" value="{{$get_info->name}}" >
            </div>
            
            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="father">Father Name</label>
            <input type="text" class="form-control" name="father_name" placeholder="Father Name" value="{{$get_info->father_name}}">
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="father">Unit</label>
            <input type="text" class="form-control" name="unit"  placeholder="Unit" value="{{$get_info->unit}}" >
            </div>

            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="village">Village Name</label>
            <input type="text" class="form-control" name="village"  placeholder="Village Name" value="{{$get_info->village}}" >
            </div>
        

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="district">District</label>
            <input type="text" class="form-control" name="district"  placeholder="District Name" value="{{$get_info->district}}" >
            </div>

            <div class="form-group col-md-6">
            <label class="mx-1" for="state">Select State</label>
            <select name="state" class="form-control" id="state">
                <option value="" hidden class="form-control ">Select State</option>
                <option value="Haryana" {{$haryana}} class="form-control ">Haryana</option>
                <option value="Rajasthan" {{$rajasthan}} class="form-control ">Rajasthan</option>
                <option value="UttarPradesh" {{$uttar_pradesh}} class="form-control ">UttarPradesh</option>
            </select>
            </div>
            
        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="state">Military / Paramilitary</label>
            <select name="military_status" class="form-control" id="state">
                <option value="" hidden class="form-control ">Military / Paramilitary</option>
                <option value="military" {{$military}} class="form-control ">Military</option>
                <option value="paramilitary" {{$paramilitary}} class="form-control ">Paramilitary</option>
            </select>
            </div>

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Post</label>
            <input type="text" class="form-control" name="post"  placeholder="पद" value="{{$get_info->post}}" >
            </div>
            
        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Army Number</label>
            <input type="text" class="form-control" name="army_no"  placeholder="Army Number" value="{{$get_info->army_no}}" >
            </div>
           

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Operation</label>
            <input type="text" class="form-control" name="operation"  placeholder="Operation" value="{{$get_info->operation}}" >
            </div>
            
        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Opertaion Serial Number</label>
            <input type="text" class="form-control" name="operation_sr_no"  placeholder="Operation Serial Number" value="{{$get_info->operation_sr_no}}" >
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