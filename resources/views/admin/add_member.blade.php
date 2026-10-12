<?php

$get_village=DB::table('village')->get();

?>


@extends('admin.layout')

@section('content')


    <div class="card">
    <div class="card-header"><strong>Add New Member</strong></div>
    <div class="card-body">
    <form class="form-group" action="{{route("store_member")}}" method="post" enctype="multipart/form-data">
        @csrf
        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mr-1" for="name">Name</label>
            <input class="form-control" name="name" id="name" type="text" placeholder="Name" >
            </div>
            
            <div class="form-group col-md-4" id="father_name">
            <label class="mx-1" for="father_name">Father Name</label>
            <input class="form-control" name="father_name" type="text" placeholder="Father Name" >
            </div>

            <div class="form-group col-md-4" id="father_select" style="display: none;">
            <label class="mx-1" for="father_name">Select Father</label>
            <select name="father_select" class="form-control" id="">
                <option value="" hidden>Select Father</option>
                @foreach ($get_fathers as $data)

                <?php
                
                    $get_gdfather=DB::table('members')
                        ->where('id',$data->father_id)
                        ->first();

                    if($get_gdfather == null){
                        $data1=array();
                        $data1['name'] = "No father";
                        $get_gdfather= (object)($data1);
                        $get_gdfather->name = "No Father Available";

                    }
                ?>
                <option value="{{$data->id}}">{{$data->name}} S/O {{$get_gdfather->name}}</option>

                @endforeach
            </select>
            </div>
            
            <div class="form-group col-md-2">
            <label class="mx-1" for="father_name">If father already registered.</label>
            <input type="checkbox" onchange="foption()" name="is_father" id="is_father">
            </div>

        </div>


        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="profession">Profession</label>
            <select name="profession" class="form-control" id="profession">
                <option value="" hidden class="form-control ">Your profession</option>
                <option value="" class="form-control ">Not Available</option>
                <option value="Professor"class="form-control ">Professor</option>
                <option value="Doctor" class="form-control ">Doctor</option>
                <option value="Engineer"class="form-control ">Engineer</option>
                <option value="Lawyer"class="form-control ">Lawyer</option>
                <option value="CA"class="form-control ">CA's</option>
                <option value="Corporates"class="form-control ">Corporates</option>
                <option value="Military"class="form-control ">Military</option>
                <option value="Goverment Servant"class="form-control ">Goverment Servant</option>
                <option value="Politician"class="form-control ">Politician</option>
                <option value="Sports"class="form-control ">Sports</option>
                <option value="Police"class="form-control ">Police</option>
                <option value="Other"class="form-control ">Other</option>
            </select>
            </div>


            <div class="form-group col-md-6">
            <label class="mr-1" for="belong_from">Belong From</label>
            <input class="form-control" id="belong_from" name="belong_from" type="text" placeholder="Belong From" >
            </div>

        </div>

        
        <div class="col-md-12" style="position: relative; display:inline-flex;">

        <div class="form-group col-md-6">
            <label class="mx-1" for="state">Select State</label>
            <select name="state" class="form-control" id="State">
                <option value="" hidden class="form-control ">Select State</option>
                <option value="1" class="form-control ">Haryana</option>
                <option value="2" class="form-control ">Rajasthan</option>
                <option value="3" class="form-control ">UttarPradesh</option>
            </select>
            </div>

            <div class="form-group col-md-6">

            <label class="mx-1" for="district">District</label>
            <select name="district" id="District" class="form-control">
             <option value="0">-- Select District --</option>
            </select>
           
            <!-- <input class="form-control" id="District" name="district" type="text" placeholder="District" > -->
            </div>



        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">
        <div class="form-group col-md-6">
            <label class="mx-1" for="current_city">Current Village</label>
            
            <select name="current_city" id="Village" class="form-control">
             <option >-- Select Village --</option>
            </select>
            </div>

            <div class="form-group col-md-6" hidden>
            <label class="mx-1" for="">Birth Place</label>
            <input class="form-control" id="birth_place" name="birth_place" type="text" placeholder="Birth Place" >
            </div>



        </div>



        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6">
            <label class="mx-1" for="achievements">Achievements</label>
            <input class="form-control" id="achievements" name="achievements" type="text" placeholder="Achievements" >
            </div>

            <div class="form-group col-md-6">
            <label class="mx-1" for="photo">Photo</label>
            <input type="file" class="form-control" name="photo" id="photo" accept="image/png, image/jpeg">
            </div>

        </div>

        <div class="col-md-12" style="position: relative; display:inline-flex;">

            <div class="form-group col-md-6" id="">
                <label class="mx-1" for="father_name">Select if First Person of the village </label>
                <select name="first_person_of_village" class="form-control" id="">
                    <option value="">Select First Village Person </option>
                    @foreach ($get_village as $data)
    
                    <option value="{{$data->village}}">{{$data->village}}</option>
    
                    @endforeach
                </select>
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

<script>

    function foption(){

    var father =document.getElementById('is_father').checked;
        if (father) {
            document.getElementById('father_name').style.display="none";
            document.getElementById('father_select').style.display="block";
        } else {
            document.getElementById('father_name').style.display="block";
            document.getElementById('father_select').style.display="none";
        }
    }
</script>

<script type="text/javascript">

        $(document).ready(function () {
              $("#State").change(function () {
             var state = $(this).val();
             $('#District').find('option').not(':first').remove();

             $.ajax({
                url: "{{url('state')}}",
                    type: "POST",
                    data: {
                        state_name: state,
                        _token: '{{csrf_token()}}'
                    },
                    dataType: 'json',
                    success:function (response) {
                    var len = 0;
                    if (response.districtdata != null) {
                        len = response.districtdata.length;
                    }

                    if (len>0) {
                        for (var i = 0; i<len; i++) {
                             var id = response.districtdata[i].id;
                             var district = response.districtdata[i].district;

                             var option = "<option value='"+id+"'>"+district+"</option>"; 

                             $("#District").append(option);
                        }
                    }
                }
                
             })
           });
        });
   </script>


<script type="text/javascript">

        $(document).ready(function () {
              $("#District").change(function () {
          
             var district = $(this).val();
            
             $('#Village').find('option').not(':first').remove();

             $.ajax({
                url: "{{url('districtname')}}",
                    type: "POST",
                    data: {
                        district: district,
                        _token: '{{csrf_token()}}'
                    },
                    dataType: 'json',
                    success:function (response) {
                    var len = 0;
                    if (response.village_data != null) {
                        len = response.village_data.length;
                    }

                    if (len>0) {
                        for (var i = 0; i<len; i++) {
                             var id = response.village_data[i].id;
                             var village = response.village_data[i].village;
                             
                             var option = "<option value='"+id+"'>"+village+"</option>"; 
                             
                             $("#Village").append(option);
                        }
                    }
                }
                
             })
           });
        });
   </script>

@endsection