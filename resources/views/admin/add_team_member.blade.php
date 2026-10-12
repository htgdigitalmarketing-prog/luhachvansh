@extends('admin.layout')

@section('content')


    <div class="card">
    <div class="card-header"><strong>Add Team Member</strong></div>
    <div class="card-body">
    <form class="form-group" action="{{route("store_team_member")}}" method="post" enctype="multipart/form-data">
        @csrf
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" >
            </div>
            
            <div class="form-group col-md-4" id="father_name">
            <label class="mx-1" for="phone">Phone No.</label>
            <input type="number" class="form-control" name="phone" maxlength="10" type="text" placeholder="Phone Number" >
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            {{-- <div class="form-group col-md-6">
            <label class="mx-1" for="profession">Profession</label>
            <select name="profession" class="form-control" id="profession">
                <option value="" hidden class="form-control ">Your profession</option>
                <option value="Professor"class="form-control ">Professor</option>
                <option value="Doctor" class="form-control ">Doctor</option>
                <option value="Engineer"class="form-control ">Engineer</option>
                <option value="Lawyer"class="form-control ">Lawyer</option>
                <option value="CA"class="form-control ">CA's</option>
                <option value="Corporates"class="form-control ">Corporates</option>
                <option value="Military"class="form-control ">Military</option>
                <option value="Civil Services"class="form-control ">Civil Services</option>
                <option value="Politician"class="form-control ">Politician</option>
            </select>
            </div> --}}

            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="village">Village Name</label>
            <input type="text" class="form-control" name="village" type="text" placeholder="Village Name" >
            </div>


            <div class="form-group col-md-6" id="father_name">
            <label class="mx-1" for="village">District</label>
            <input type="text" class="form-control" name="profession" type="text" placeholder="District" >
            </div>
        

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="post">Post</label>
            <input class="form-control" name="post" id="post" type="text" placeholder="Post" >
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