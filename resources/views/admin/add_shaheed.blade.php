@extends('admin.layout')

@section('content')


    <div class="card">
    <div class="card-header"><strong>Add Shaheed</strong></div>
    <div class="card-body">
    <form class="form-group" action="{{route("store_shaheed")}}" method="post" enctype="multipart/form-data">
        @csrf
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" >
            </div>
            
            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="father">Father Name</label>
            <input type="text" class="form-control" name="father_name" placeholder="Father Name" >
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="father">Unit</label>
            <input type="text" class="form-control" name="unit"  placeholder="Unit" >
            </div>

            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="village">Village Name</label>
            <input type="text" class="form-control" name="village"  placeholder="Village Name" >
            </div>
        

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="district">District</label>
            <input type="text" class="form-control" name="district"  placeholder="District Name" >
            </div>

            <div class="form-group col-md-6">
            <label class="mx-1" for="state">Select State</label>
            <select name="state" class="form-control" id="state">
                <option value="" hidden class="form-control ">Select State</option>
                <option value="Haryana" class="form-control ">Haryana</option>
                <option value="Rajasthan" class="form-control ">Rajasthan</option>
                <option value="UttarPradesh" class="form-control ">UttarPradesh</option>
            </select>
            </div>
            
        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="state">Military / Paramilitary</label>
            <select name="military_status" class="form-control" id="state">
                <option value="" hidden class="form-control ">Military / Paramilitary</option>
                <option value="military" class="form-control ">Military</option>
                <option value="paramilitary" class="form-control ">Paramilitary</option>
            </select>
            </div>

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Post</label>
            <input type="text" class="form-control" name="post"  placeholder="पद" >
            </div>
            
        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Army Number</label>
            <input type="text" class="form-control" name="army_no"  placeholder="Army Number" >
            </div>
           

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Operation</label>
            <input type="text" class="form-control" name="operation"  placeholder="Operation" >
            </div>
            
        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="unit">
            <label class="mx-1" for="post">Opertaion Serial Number</label>
            <input type="text" class="form-control" name="operation_sr_no"  placeholder="Operation Serial Number" >
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